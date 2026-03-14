import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const DataContext = createContext({});

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    try {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        const productData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productData);
        setLoading(false);
        setDbError(null);
      }, (err) => {
        console.error("Firestore error for products:", err);
        setDbError(err.message);
        setLoading(false);
      });

      const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
        const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(txData);
      }, (err) => {
        console.error("Firestore error for transactions:", err);
        setDbError(err.message);
      });

      return () => {
        unsubProducts();
        unsubTransactions();
      };
    } catch(e) {
      console.error("Initial Firestore connection error:", e);
      setDbError(e.message);
      setLoading(false);
    }
  }, []);

  const addProduct = async (productData) => {
    await addDoc(collection(db, 'products'), {
      ...productData,
      stock: productData.initialStock || 0,
      createdAt: serverTimestamp()
    });
  };

  const logTransaction = async (txData) => {
    await addDoc(collection(db, 'transactions'), {
      ...txData,
      date: serverTimestamp()
    });
  };

  const updateProductStock = async (productId, currentStock, quantityChange, txDetails) => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      stock: currentStock + quantityChange,
      updatedAt: serverTimestamp()
    });
    if (txDetails) await logTransaction(txDetails);
  };

  return (
    <DataContext.Provider value={{ products, transactions, addProduct, updateProductStock, loading, dbError }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
