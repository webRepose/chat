export const isURL = (str) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export const Consolidate = async (
  pinmess,
  del,
  id,
  updateDoc,
  chatRefUser1,
  chatRefUser2,
  setModal
) => {
  setModal((prev) => (prev = false));
  if (!del) {
    await updateDoc(chatRefUser1, {
      pined: pinmess,
      idMessage: id,
    });

    if (chatRefUser2) {
      await updateDoc(chatRefUser2, {
        pined: pinmess,
        idMessage: id,
      });
    }
  } else {
    const resDel = window.confirm(
      "Вы действительно хотите удалить закрепленное сообщение?"
    );
    if (resDel) {
      await updateDoc(chatRefUser1, {
        pined: "",
        idMessage: "",
      });

      if (chatRefUser2) {
        await updateDoc(chatRefUser2, {
          pined: "",
          idMessage: "",
        });
      }
    }
  }
};

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
  await updateDoc(
    doc(db, "users", dataChats, "chats", idFromHref, "messages", idDoc),
    {
      text: valueRewrite.trim(),
      changed: true,
    }
  );

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

  setValueRewrite("");
  setModeType((prev) => (prev = true));
};

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
    await deleteDoc(
      doc(db, "users", dataChats, "chats", idFromHref, "messages", value)
    );

    if (
      document.getElementById(`#${Number(idMessage.replace("#", ""))}`) === null
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

  setModalMessage((prev) => (prev = false));
};

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

  bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  setValue("");

  await updateDoc(chatRefUser1, {
    text: value.trim(),
    time: date,
  });

  await updateDoc(chatRefUser2, {
    text: value.trim(),
    time: date,
  });
};

export const Pined = async (
  getDoc,
  doc,
  db,
  dataChats,
  idFromHref,
  setPined,
  setPinedIdMessage
) => {
  const e = await getDoc(doc(db, "users", dataChats, "chats", idFromHref));
  setPined((prev) => (prev = e.data().pined));
  setPinedIdMessage((prev) => (prev = e.data().idMessage));
};

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
