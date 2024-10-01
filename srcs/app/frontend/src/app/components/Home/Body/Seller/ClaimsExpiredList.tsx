/*
srcs/app/frontend/src/app/components/Body/Seller/ClaimsExpiredList.tsx
期限が切れ、PDAから回収できるトランザクションのリストのcomponentです。
*/

'use client';

import React, { useEffect, useState } from 'react';
import WithdrawButton from './WithdrawButton';
import styles from '../../../../styles/Body/Seller/ClaimsExpiredList.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = new PublicKey(
  'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);
const CONNECTION = new Connection('http://localhost:8899/');

const getCurrentDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

interface WithdrawTransaction {
  buyerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: bigint;
  reason: string;
}

function is_expired_refund(buffer: Buffer): boolean {
  const refundDeadline = Number(buffer.readBigInt64LE(96));
  const now = Math.floor(Date.now() / 1000);
  return refundDeadline < now;
}

// 買い手の公開鍵が引数と一致し、返金処理可能な取引を取得
async function fetchTransactions(
  programId: PublicKey,
  connection: Connection,
  sellerPubkey: PublicKey
): Promise<WithdrawTransaction[]> {
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 8,
          bytes: sellerPubkey.toBase58(),
        },
      },
    ],
  });

  const returnableTransactionArray: WithdrawTransaction[] = [];
  for (let i = 0; i < accounts.length; i++) {
    const accountData = accounts[i].account.data;

    // Buffer型かをチェック
    if (!Buffer.isBuffer(accountData)) {
      continue;
    }

    // PDAに残高が存在するかをチェック
    // (取引した金額 <= PDAの残高)
    const lamports = accounts[i].account.lamports; // 残高
    const amountLamports = accountData.readBigUInt64LE(80); // 取引額
    if (lamports < amountLamports) {
      continue;
    }

    // 返金期間外 && キャンセルされていない
    if (is_expired_refund(accountData)) {
      const data = decodeRefundableEscrow(accountData);
      returnableTransactionArray.push(data);
    }
  }
  return returnableTransactionArray;
}

function decodeRefundableEscrow(buffer: Buffer): WithdrawTransaction {
  const buyerPubkey = buffer.slice(40, 72);
  const transactionId = buffer.readBigUInt64LE(72);
  const amountLamports = buffer.readBigUInt64LE(80);
  const userDefinedData = buffer
    .slice(109)
    .toString('utf-8')
    .replace(/\u0000/g, '')
    .trim();
  const refundDeadline = buffer.readBigInt64LE(96);

  return {
    buyerAddress: new PublicKey(buyerPubkey).toString(),
    id: transactionId.toString(),
    transactionAmount: Number(amountLamports),
    deadline: refundDeadline,
    reason: userDefinedData,
  };
}

const ClaimsExpiredList = () => {
  const [transactions, setTransactions] = useState<WithdrawTransaction[]>([]);

  const { publicKey } = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      if (publicKey) {
        const withdrawTransactions = await fetchTransactions(
          PROGRAM_ID,
          CONNECTION,
          publicKey
        );
        setTransactions(withdrawTransactions);
      }
    };
    fetchData();
  }, [publicKey]);

  return (
    <div className={styles.ClaimsExpiredListContainer}>
      <h2 className={styles.sectionTitle}>Refund expired</h2>
      <div className={styles.transactionListWrapper}>
        <ul className={styles.transactionList}>
          {transactions.map((transaction, index) => (
            <li key={index} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerAddress}>
                    {transaction.buyerAddress}
                  </div>
                  <div className={styles.transactionAmount}>
                    {transaction.transactionAmount} SOL
                  </div>
                </div>
                <div className={styles.sellerInfo2}>
                  <div className={styles.transactionDate}>Withdraw OK</div>
                  <div className={styles.transactionId}>
                    Transaction ID: {transaction.id}
                  </div>
                </div>
                {publicKey && (
                  <WithdrawButton
                    buyer_pubkey={new PublicKey(transaction.buyerAddress)}
                    seller_pubkey={publicKey}
                    transactionId={BigInt(transaction.id)}
                  />
                )}
              </div>
              <div className={styles.transactionReason}>
                {transaction.reason}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ClaimsExpiredList;
