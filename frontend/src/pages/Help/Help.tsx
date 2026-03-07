import { useState } from 'react'
import './help_page.css'

type FaqItem = { id: string; question: string; answer: string }

const FAQ_ITEMS: FaqItem[] = [
  {
    id: '1',
    question: 'Comment puis-je créer un compte ?',
    answer: "Pour créer un compte sur SkillSwap, clique simplement sur le bouton \"S'inscrire\" en haut à droite de la page d'accueil. Tu peux t'inscrire avec ton adresse e-mail. Une fois ton compte créé, tu pourras compléter ton profil, proposer des compétences, et commencer à échanger avec la communauté !",
  },
  {
    id: '2',
    question: 'Comment modifier mes informations personnelles ?',
    answer: "Pour modifier tes informations personnelles, connecte-toi à ton compte, puis rends-toi dans la section \"Profil\" depuis le menu utilisateur. Tu pourras y mettre à jour ton nom, ta bio, tes disponibilités, tes compétences proposées et toutes les autres informations visibles par la communauté. N'oublie pas d'enregistrer les modifications !",
  },
  {
    id: '3',
    question: 'Est-ce que tout est vraiment gratuit ?',
    answer: "Oui, SkillSwap est entièrement gratuit ! Notre objectif est de permettre aux utilisateurs de partager leurs compétences et d'en apprendre d'autres, sans échange d'argent. Il suffit de proposer une compétence pour en apprendre une autre en retour — tout est basé sur l'échange et l'entraide, sans frais.",
  },
]

export default function Help() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <>
      <div className="ss-help-header">
        <i className="fas fa-question-circle ss-help-header-icon"></i>
        <h1 className="ss-help-title">Besoin d'aide ?</h1>
        <p className="ss-help-subtitle">Nous sommes là pour vous accompagner</p>
      </div>

      <main className="ss-help-main">
        <div className="ss-help-container">

          <div className="ss-help-tip">
            <i className="fas fa-lightbulb ss-help-tip-icon"></i>
            <p className="ss-help-tip-text">
              <strong>Astuce :</strong> Consultez d'abord notre FAQ ci-dessous, vous y trouverez peut-être la réponse à votre question !
            </p>
          </div>

          <section className="ss-help-faq">
            <h2 className="ss-help-section-title">
              <i className="fas fa-comments"></i>
              Questions fréquentes
            </h2>

            {FAQ_ITEMS.map((item) => (
              <div key={item.id} className="ss-help-faq-card">
                <div className="ss-help-faq-header">
                  <p className="ss-help-faq-question">{item.question}</p>
                  <button
                    className="ss-help-faq-toggle"
                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  >
                    {openId === item.id ? '−' : '+'}
                  </button>
                </div>
                {openId === item.id && (
                  <div className="ss-help-faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="ss-help-contact">
            <h2 className="ss-help-section-title">
              <i className="fas fa-envelope"></i>
              Contactez-nous
            </h2>
            <div className="ss-help-contact-grid">
              <div className="ss-help-contact-card">
                <div className="ss-help-contact-icon"><i className="fas fa-envelope"></i></div>
                <div className="ss-help-contact-label">Par email</div>
                <a href="mailto:contact@skillswap.fr" className="ss-help-contact-link">contact@skillswap.fr</a>
                <p className="ss-help-contact-subtext">Réponse sous 24-48h</p>
              </div>
              <div className="ss-help-contact-card">
                <div className="ss-help-contact-icon"><i className="fas fa-phone"></i></div>
                <div className="ss-help-contact-label">Par téléphone</div>
                <a href="tel:+33123456789" className="ss-help-contact-link">01 23 45 67 89</a>
                <p className="ss-help-contact-subtext">Lun-Ven : 9h-18h</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
