import Style from "../styles/UI_kit/Section/Section.module.css";

const Section = (props) => {
  return <section className={Style.section}>{props.children}</section>;
};

export default Section;
