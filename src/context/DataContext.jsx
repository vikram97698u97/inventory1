import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const DataContext = createContext({});

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const productsQuery = query(collection(db, 'products'), where('userId', '==', user.uid));
      const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
        const productData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productData);
        setLoading(false);
        setDbError(null);
      }, (err) => {
        console.error("Firestore error for products:", err);
        setDbError(err.message);
        setLoading(false);
      });

      const txQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const unsubTransactions = onSnapshot(txQuery, (snapshot) => {
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
  }, [user]);

  const addProduct = async (productData) => {
    if (!user) return;
    await addDoc(collection(db, 'products'), {
      ...productData,
      userId: user.uid,
      stock: productData.initialStock || 0,
      createdAt: serverTimestamp()
    });
  };

  const logTransaction = async (txData) => {
    if (!user) return;
    await addDoc(collection(db, 'transactions'), {
      ...txData,
      userId: user.uid,
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
