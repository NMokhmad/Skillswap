import { Link } from 'react-router-dom'

// Composant pur : aucun état, aucune props
// Juste les liens de navigation statiques
export default function NavLinks() {
  return (
    <div className="ss-nav-links">
      <Link to="/" className="ss-nav-link">
        <i className="fas fa-home"></i>
        <span>Accueil</span>
      </Link>
      <Link to="/talents" className="ss-nav-link">
        <i className="fas fa-users"></i>
        <span>Talents</span>
      </Link>
      <Link to="/skills" className="ss-nav-link">
        <i className="fas fa-star"></i>
        <span>Compétences</span>
      </Link>
      <Link to="/search" className="ss-nav-link">
        <i className="fas fa-search"></i>
        <span>Recherche</span>
      </Link>
      <Link to="/help" className="ss-nav-link">
        <i className="fas fa-question-circle"></i>
        <span>Aide</span>
      </Link>
    </div>
  )
}
