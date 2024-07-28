// Импорт необходимых компонентов и хуков
import { Route, Routes, Navigate } from "react-router-dom";
import React, { lazy, memo, Suspense } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "..";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query } from "firebase/firestore";
import { useState, useEffect } from "react";
import Saved from "../chats/Saved";
import ChatUsers from "../chats/Chat";
import ErrorBoundary from "./ErrorBounds/ErrorBoundary";

// Ленивая загрузка компонентов
const Preloader = lazy(() => import("./Preloaders/Preloader")),
  Login = lazy(() => import("./Login")),
  Menu = lazy(() => import("../menu/Menu"));

// Публичные маршруты
const publicRoutes = [
  {
    path: "/login",
    Component: Login,
  },
];

// Приватные маршруты
const privateRoutes = [
  {
    path: "/saved",
    Component: Saved,
  },
  {
    path: "/",
    Component: Menu,
  },
];

// Компонент маршрутизатора приложения
const AppRouter = memo(() => {
  const [user] = useAuthState(auth);
  let uid;
  if (user) uid = user.uid;
  else uid = "  ";
  const [userLink, setUserLink] = useState([]),
    [dataLinks, setDataLinks] = useState([]),
    [chatsID, setChatsID] = useState([]),
    [chatsAll] = useCollectionData(
      query(collection(db, "users", uid, "chats"))
    );

  // Обновление списка чатов пользователя при изменении
  useEffect(() => {
    if (chatsAll) {
      const data = chatsAll.map((data) => data.id);
      setUserLink((prev) => (prev = data));

      const data2 = chatsAll.map((data) => data.idChats);
      setChatsID((prev) => (prev = data2));
    }
  }, [chatsAll]);

  // Генерация маршрутов для каждого чата пользователя
  useEffect(() => {
    const userLinksObj = userLink.map((data, id) => ({
      id: id,
      path: "/" + data,
      Component: ChatUsers,
    }));
    setDataLinks((prev) => (prev = userLinksObj));
  }, [userLink]);

  // Отображение маршрутов в зависимости от статуса авторизации пользователя
  return user ? (
    <Routes>
      {privateRoutes &&
        privateRoutes.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<Preloader />}>
                <ErrorBoundary>
                  <Component />
                </ErrorBoundary>
              </Suspense>
            }
          />
        ))}
      {dataLinks &&
        dataLinks.map(({ path, Component, id }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<Preloader />}>
                <ErrorBoundary>
                  <Component dataChats={chatsID[id]} />
                </ErrorBoundary>
              </Suspense>
            }
          />
        ))}
      <Route path="*" replace element={<Menu />}></Route>
    </Routes>
  ) : (
    <Routes>
      {publicRoutes &&
        publicRoutes.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<Preloader />}>
                <ErrorBoundary>
                  <Component />
                </ErrorBoundary>
              </Suspense>
            }
          />
        ))}
      <Route path="*" element={<Navigate to={"/login"} replace />} />
    </Routes>
  );
});

// Экспорт компонента AppRouter
export default AppRouter;
