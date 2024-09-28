/*
srcs/app/frontend/src/app/components/Body/Seller/ClaimsExpiredList.tsx
期限が切れ、PDAから回収できるトランザクションのリストのcomponentです。
*/


'use client'

import React, { useEffect, useState } from 'react';
//import ReturnSolButton from './ReturnSolButton';
import WithdrawButton from './WithdrawButton';
import styles from '../../../styles/Body/Seller/ClaimsExpiredList.module.css'; 

/*
const getCurrentDate = (): string => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので1を足す
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
*/

interface NotRetTransaction {
  sellerAddress: string;
  id: string;
  transactionAmount: number;
  deadline: string;
  reason: string;
};

const ClaimsExpiredList = () => {

    const [transactions, setTransactions] = useState([]);

    // データ取得の例
    useEffect(() => {
      const fetchData = async () => {
        // ここでAPIからデータを取得する
        const transactions: NotRetTransaction[] = [
          { sellerAddress: 'ユーザーA`', id: "1234567891085552", transactionAmount: 100, deadline: '2024-09-01 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーB`', id: "1234567891085552", transactionAmount: 200, deadline: '2024-09-02 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーC`', id: "1234567891085552", transactionAmount: 150, deadline: '2024-09-03 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーD`', id: "1234567891085552", transactionAmount: 300, deadline: '2024-09-04 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーE`', id: "1234567891085552", transactionAmount: 300, deadline: '2024-09-04 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーF`', id: "1234567891085552", transactionAmount: 300, deadline: '2024-09-04 11:00', reason: 'netflix, standard plan' },
          { sellerAddress: 'ユーザーG`', id: "1234567891085552", transactionAmount: 300, deadline: '2024-09-04 11:00', reason: 'netflix, standard plan' },
          // さらに要素を追加可能
        ];
        setTransactions(transactions);
      };
  
      fetchData();
    }, []);

    //const nowDate = getCurrentDate();
    return (
      <div className={styles.unrecoverableListContainer}>
        <h2 className={styles.sectionTitle}>Refund expired</h2>
        <div className={styles.transactionListWrapper}>

        <ul className={styles.transactionList}>
          {transactions.map((transaction, index) => (
            <li key={index} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerAddress}>{transaction.sellerAddress}</div>
                  <div className={styles.transactionAmount}>{transaction.transactionAmount} SOL</div>
                </div>
                <div className={styles.sellerInfo2}>
                  <div className={styles.transactionDate}>Withdraw OK</div>
                  <div className={styles.transactionId}>Transaction ID: {transaction.id}</div>
                </div>
                <WithdrawButton/>
              </div>
              <div className={styles.transactionReason}>{transaction.reason}</div>
            </li>
          ))}
        </ul>
        </div>
      </div>
    );

}

export default ClaimsExpiredList;