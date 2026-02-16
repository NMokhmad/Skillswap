/**
 * Ajoute une propriété averageRating à chaque user
 * à partir de ses received_reviews.
 * Retourne un tableau d'objets JSON (pas des instances Sequelize).
 */
export function addAverageRating(users) {
  return users.map(user => {
    const reviews = user.received_reviews || [];
    const total = reviews.reduce((sum, r) => sum + r.rate, 0);
    const average = reviews.length ? total / reviews.length : 0;
    return {
      ...user.toJSON(),
      averageRating: average
    };
  });
}
