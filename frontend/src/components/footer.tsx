import './footer.css';

function Footer() {
  return (
    <footer className="ss-footer">
        <div className="ss-footer-inner">

            {/*Logo + slogan*/} 
            <div className="ss-footer-brand">
                <p className="ss-footer-logo"><em>Skill</em>Swap</p>
                <p className="ss-footer-slogan">Échangez vos talents, enrichissez vos compétences</p>
            </div>

            {/* Réseaux sociaux */}
            <div className="ss-footer-social">
                <p className="ss-footer-social-label">Suivez-nous</p>
                <div className="ss-footer-social-row">
                    <a href="#" className="ss-social-icon" aria-label="Facebook">
                        <i className="fab fa-facebook-f ss-social-fa"></i>
                    </a>
                    <a href="#" className="ss-social-icon" aria-label="Instagram">
                        <i className="fab fa-instagram ss-social-fa"></i>
                    </a>
                    <a href="#" className="ss-social-icon" aria-label="Twitter / X">
                        <i className="fab fa-x-twitter ss-social-fa"></i>
                    </a>
                    <a href="#" className="ss-social-icon" aria-label="LinkedIn">
                        <i className="fab fa-linkedin-in ss-social-fa"></i>
                    </a>
                </div>
            </div>

            {/* Colonnes de liens */}
            <div className="ss-footer-cols">
                <div className="ss-footer-col">
                    <div className="ss-footer-col-icon">
                        <i className="fas fa-question-circle"></i>
                    </div>
                    <h3 className="ss-footer-col-title">Assistance</h3>
                    <a href="/help" className="ss-footer-link">
                        <i className="fas fa-chevron-right"></i>
                        Page d'aide
                    </a>
                </div>

                <div className="ss-footer-col">
                    <div className="ss-footer-col-icon">
                        <i className="fas fa-search"></i>
                    </div>
                    <h3 className="ss-footer-col-title">Recherches</h3>
                    <a href="/review" className="ss-footer-link">
                        <i className="fas fa-chevron-right"></i>
                        Avis
                    </a>
                    <a href="/talents" className="ss-footer-link">
                        <i className="fas fa-chevron-right"></i>
                        Talents
                    </a>
                </div>

                <div className="ss-footer-col">
                    <div className="ss-footer-col-icon">
                        <i className="fas fa-book"></i>
                    </div>
                    <h3 className="ss-footer-col-title">Ressources</h3>
                    <a href="/legal-notices" className="ss-footer-link">
                        <i className="fas fa-chevron-right"></i>
                        Mentions légales
                    </a>
                </div>
            </div>

            <hr className="ss-footer-sep"/>

            <p className="ss-footer-copy">
                &copy; 2025 <strong>SkillSwap</strong> — Tous droits réservés
            </p>

        </div>
    </footer>
  );
}

export default Footer;