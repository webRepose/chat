import { Link } from "react-router-dom";
import Style from "../styles/components/back/back.module.css";

const Back = () => {
  return (
    <Link to={"/"}>
      <button className={Style.back}>
        <img width={16} src="../img/back.svg" alt="back" />
      </button>
    </Link>
  );
};

export default Back;
