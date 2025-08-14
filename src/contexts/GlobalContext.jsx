import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? storedToken : null;
  });
  const [selectedTable, setSelectedTable] = useState({});
  const [shop, setShop] = useState(() => {
    const storedShop = JSON.parse(localStorage.getItem("shop"));
    return storedShop ? storedShop : null;
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const backendURL = "https://www.inovasyonbulutu.com/bivadan/api/";

  useEffect(() => {
    if (localStorage.getItem("user")) {
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [token]);

  const value = {
    token,
    setToken,
    shop,
    setShop,
    user,
    setUser,
    backendURL,
    selectedTable,
    setSelectedTable,
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
