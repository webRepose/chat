// Проверка, является ли строка валидным URL
export const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

// Функция для закрепления или открепления сообщения
export const Consolidate = async (
  pinmess,
  del,
  id,
  updateDoc,
  chatRefUser1,
  chatRefUser2,
  setModal
) => {
  // Закрываем модальное окно
  setModal((prev) => (prev = false));
  if (!del) {
    // Закрепляем сообщение в коллекции пользователя 1
    await updateDoc(chatRefUser1, {
      pined: pinmess,
      idMessage: id,
    });

    // Если есть коллекция пользователя 2, закрепляем сообщение там
    if (chatRefUser2) {
      await updateDoc(chatRefUser2, {
        pined: pinmess,
        idMessage: id,
      });
    }
  } else {
    // Если пользователь решил удалить закрепленное сообщение
    const resDel = window.confirm(
      "Вы действительно хотите удалить закрепленное сообщение?"
    );
    if (resDel) {
      // Открепляем сообщение в коллекции пользователя 1
      await updateDoc(chatRefUser1, {
        pined: "",
        idMessage: "",
      });

      // Если есть коллекция пользователя 2, открепляем сообщение там
      if (chatRefUser2) {
        await updateDoc(chatRefUser2, {
          pined: "",
          idMessage: "",
        });
      }
    }
  }
};

// Функция для обновления текста сообщения
export const UpdateButton = async (
  valueRewrite,
  updateDoc,
  doc,
  db,
  dataChats,
  idFromHref,
  idDoc,
  idMessage,
  pinedIdMessage,
  chatRefUser1,
  chatRefUser2,
  setValueRewrite,
  setModeType
) => {
  if (valueRewrite.length === 0) return 0;
  // Обновляем текст сообщения в коллекции
  await updateDoc(
    doc(db, "users", dataChats, "chats", idFromHref, "messages", idDoc),
    {
      text: valueRewrite.trim(),
      changed: true,
    }
  );

  // Если сообщение последнее в чате, обновляем его в коллекциях пользователей
  if (
    document.getElementById(`#${Number(idMessage.replace("#", "")) + 1}`) ===
    null
  ) {
    await updateDoc(chatRefUser1, {
      text: valueRewrite.trim(),
    });

    await updateDoc(chatRefUser2, {
      text: valueRewrite.trim(),
    });
  }

  // Если сообщение было закреплено, обновляем закрепленное сообщение в коллекциях пользователей
  if (idMessage === pinedIdMessage) {
    await updateDoc(chatRefUser1, {
      pined: valueRewrite.trim(),
      idMessage: idMessage,
    });

    await updateDoc(chatRefUser2, {
      pined: valueRewrite.trim(),
      idMessage: idMessage,
    });
  }

  // Сбрасываем значения
  setValueRewrite("");
  setModeType((prev) => (prev = true));
};

// Функция для обновления значения в режиме редактирования сообщения
export const Update = (
  setModeType,
  messages,
  idDoc,
  idMessageList,
  setValueRewrite,
  setModalMessage
) => {
  setModeType((prev) => (prev = false));
  messages.forEach((data, i) => {
    idDoc === idMessageList[i] && setValueRewrite((prev) => (prev = data.text));
  });
  setModalMessage((prev) => (prev = false));
};

// Функция для удаления сообщения
export const DeleteButton = async (
  deleteDoc,
  doc,
  db,
  dataChats,
  idFromHref,
  value,
  idMessage,
  pinedIdMessage,
  updateDoc,
  chatRefUser1,
  chatRefUser2,
  setModalMessage
) => {
  const resDel = window.confirm(
    "Вы действительно хотите удалить это сообщение?"
  );

  if (resDel) {
    // Удаляем сообщение из коллекции
    await deleteDoc(
      doc(db, "users", dataChats, "chats", idFromHref, "messages", value)
    );

    // Если удаляемое сообщение последнее в чате, обновляем последнее сообщение в коллекциях пользователей
    if (
      document.getElementById(`#${Number(idMessage.replace("#", ""))}`) ===
      null
    ) {
      let res;
      if (
        document.getElementById(`#${Number(idMessage.replace("#", "")) - 1}`)
          .children[0].children[0].children[0].children[0].children[0]
          .textContent === ""
      ) {
        res = document.getElementById(
          `#${Number(idMessage.replace("#", "")) - 1}`
        ).children[0].children[0].children[0].children[1].children[0]
          .textContent;
      } else {
        res = document.getElementById(
          `#${Number(idMessage.replace("#", "")) - 1}`
        ).children[0].children[0].children[0].children[0].children[0]
          .textContent;
      }

      await updateDoc(chatRefUser1, {
        text: res,
      });

      await updateDoc(chatRefUser2, {
        text: res,
      });
    }

    // Если удаляемое сообщение было закреплено, обновляем закрепленное сообщение в коллекциях пользователей
    if (idMessage === pinedIdMessage) {
      await updateDoc(chatRefUser1, {
        pined: "",
        idMessage: "",
      });

      await updateDoc(chatRefUser2, {
        pined: "",
        idMessage: "",
      });
    }
  }

  // Скрываем модальное окно
  setModalMessage((prev) => (prev = false));
};

// Функция для отправки сообщения
export const Send = async (
  value,
  setValue,
  bottomRef,
  addDoc,
  collection,
  db,
  dataChats,
  idFromHref,
  user,
  date,
  updateDoc,
  chatRefUser1,
  chatRefUser2
) => {
  if (!value || value.trim().length < 1) {
    setValue("");
    bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    return 0;
  }

  // Добавляем сообщение в коллекцию
  await addDoc(
    collection(db, "users", dataChats, "chats", idFromHref, "messages"),
    {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      text: value.trim(),
      createdAt: date,
      changed: false,
    }
  );

  // Прокручиваем к последнему сообщению
  bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  setValue("");

  // Обновляем текст последнего сообщения в коллекциях пользователей
  await updateDoc(chatRefUser1, {
    text: value.trim(),
    time: date,
  });

  await updateDoc(chatRefUser2, {
    text: value.trim(),
    time: date,
  });
};

// Функция для получения закрепленного сообщения
export const Pined = async (
  getDoc,
  doc,
  db,
  dataChats,
  idFromHref,
  setPined,
  setPinedIdMessage
) => {
  // Получаем данные о закрепленном сообщении из коллекции
  const e = await getDoc(doc(db, "users", dataChats, "chats", idFromHref));
  setPined((prev) => (prev = e.data().pined));
  setPinedIdMessage((prev) => (prev = e.data().idMessage));
};

// Функция для форматирования даты
export const DateFun = (data) => {
  const hours =
    data && data.toDate().getHours() < 10
      ? "0" + data.toDate().getHours()
      : data.toDate().getHours();
  const minutes =
    data && data.toDate().getMinutes() !== 0
      ? data.toDate().getMinutes() < 10
        ? "0" + data.toDate().getMinutes()
        : data.toDate().getMinutes()
      : data.toDate().getMinutes() + "0";
  return hours + ":" + minutes;
};
