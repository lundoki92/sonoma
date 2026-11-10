import "./Button.css";

export default function Button({
  text,
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button className="button" type={type} disabled={disabled} {...props}>
      {text}
    </button>
  );
}
