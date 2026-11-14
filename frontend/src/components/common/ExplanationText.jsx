import "./ExplanationText.css";

export default function ExplanationText({
  hasAppTitle = true,
  title,
  text,
}) {
  return (
    <section className="explanation-text">
      {hasAppTitle && (
        <div className="explanation-text-app-title">
          SONOMA
        </div>
      )}

      {title && (
        <h1 className="explanation-text-title">
          {title}
        </h1>
      )}

      {text && (
        <p className="explanation-text-text">
          {text}
        </p>
      )}
    </section>
  );
}
