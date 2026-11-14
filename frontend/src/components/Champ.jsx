// Un champ de formulaire accessible : label relié, message d'erreur annoncé
import "./Champ.css";

export function Champ({ id, label, erreur, ...props }) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        aria-invalid={erreur ? 'true' : undefined}
        aria-describedby={erreur ? `${id}-erreur` : undefined}
        {...props}
      />
      {erreur && <p className="erreur" id={`${id}-erreur`}>{erreur}</p>}
    </div>
  )};