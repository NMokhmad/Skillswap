import { Op } from 'sequelize';
import { User, Skill, SavedSearch } from '../models/index.js';
import { sequelize } from '../database.js';
import { sendApiError, sendApiSuccess } from '../helpers/apiResponse.js';
import { logger } from '../helpers/logger.js';

const AVG_RATING_SQL = 'COALESCE((SELECT AVG(r.rate)::numeric FROM "review" r WHERE r."reviewed_id" = "User"."id"), 0)';
const REVIEW_COUNT_SQL = '(SELECT COUNT(*) FROM "review" r WHERE r."reviewed_id" = "User"."id")';
const ALLOWED_SORTS = new Set(['rating_desc', 'rating_asc', 'newest', 'popular']);

function parseSkillsQuery(query) {
  const raw = query.skills ?? query['skills[]'] ?? [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const parsed = arr
    .map((skillId) => Number.parseInt(skillId, 10))
    .filter((skillId) => Number.isInteger(skillId) && skillId > 0);

  return [...new Set(parsed)];
}

function normalizeFilters(input = {}) {
  const q = typeof input.q === 'string' ? input.q.trim() : '';
  const city = typeof input.city === 'string' ? input.city.trim() : '';
  const skills = Array.isArray(input.skills)
    ? input.skills.map((id) => Number.parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0)
    : [];
  const sort = ALLOWED_SORTS.has(input.sort) ? input.sort : 'rating_desc';
  const minRatingRaw = Number.parseFloat(input.min_rating);
  const minRating = Number.isFinite(minRatingRaw) ? Math.max(0, Math.min(5, minRatingRaw)) : 0;

  return {
    q,
    city,
    skills: [...new Set(skills)],
    sort,
    min_rating: minRating,
  };
}

function getOrder(sort) {
  const avgRatingLiteral = sequelize.literal(AVG_RATING_SQL);
  const reviewCountLiteral = sequelize.literal(REVIEW_COUNT_SQL);

  switch (sort) {
  case 'rating_asc':
    return [[avgRatingLiteral, 'ASC']];
  case 'newest':
    return [['created_at', 'DESC']];
  case 'popular':
    return [[avgRatingLiteral, 'DESC'], [reviewCountLiteral, 'DESC']];
  case 'rating_desc':
  default:
    return [[avgRatingLiteral, 'DESC']];
  }
}

const searchController = {
  async getSearchPage(req, res) {
    try {
      const skills = await Skill.findAll({
        attributes: ['id', 'label'],
        order: [['label', 'ASC']],
      });

      res.render('search', {
        title: 'Recherche',
        cssFile: 'search',
        skills,
        initialQuery: typeof req.query.q === 'string' ? req.query.q : '',
      });
    } catch (error) {
      logger.error('get_search_page_failed', { error: error?.message || 'Unknown error' });
      res.status(500).send('Erreur serveur');
    }
  },

  async searchTalents(req, res) {
    try {
      const pageRaw = Number.parseInt(req.query.page, 10);
      const limitRaw = Number.parseInt(req.query.limit, 10);
      const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
      const limit = Number.isInteger(limitRaw) ? Math.max(1, Math.min(24, limitRaw)) : 9;
      const offset = (page - 1) * limit;

      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
      const skills = parseSkillsQuery(req.query);
      const sort = ALLOWED_SORTS.has(req.query.sort) ? req.query.sort : 'rating_desc';
      const minRatingRaw = Number.parseFloat(req.query.min_rating);
      const minRating = Number.isFinite(minRatingRaw) ? Math.max(0, Math.min(5, minRatingRaw)) : 0;

      const where = {};

      if (q) {
        const searchTerm = `%${q}%`;
        where[Op.or] = [
          { firstname: { [Op.iLike]: searchTerm } },
          { lastname: { [Op.iLike]: searchTerm } },
        ];
      }

      if (city) {
        where.city = { [Op.iLike]: `%${city}%` };
      }

      const buildSkillFilterInclude = () => ({
        model: Skill,
        as: 'skills',
        attributes: [],
        through: { attributes: [] },
        required: true,
        where: { id: { [Op.in]: skills } },
      });

      let total = 0;
      if (minRating > 0) {
        const totalRows = await User.findAll({
          attributes: ['id'],
          where,
          include: skills.length ? [buildSkillFilterInclude()] : [],
          group: ['User.id'],
          having: sequelize.where(sequelize.literal(AVG_RATING_SQL), { [Op.gte]: minRating }),
          raw: true,
          subQuery: false,
        });
        total = totalRows.length;
      } else {
        total = await User.count({
          where,
          include: skills.length ? [buildSkillFilterInclude()] : [],
          distinct: true,
          col: 'User.id',
        });
      }

      const baseRows = await User.findAll({
        attributes: [
          'id',
          [sequelize.literal(AVG_RATING_SQL), 'average_rating'],
          [sequelize.literal(REVIEW_COUNT_SQL), 'review_count'],
        ],
        where,
        include: skills.length ? [buildSkillFilterInclude()] : [],
        group: ['User.id'],
        having: minRating > 0
          ? sequelize.where(sequelize.literal(AVG_RATING_SQL), { [Op.gte]: minRating })
          : undefined,
        order: getOrder(sort),
        limit,
        offset,
        raw: true,
        subQuery: false,
      });

      const ids = baseRows.map((row) => Number.parseInt(row.id, 10));
      if (!ids.length) {
        return sendApiSuccess(res, {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          results: [],
        });
      }

      const users = await User.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'firstname', 'lastname', 'image', 'city'],
        include: [
          {
            model: Skill,
            as: 'skills',
            attributes: ['id', 'label', 'slug'],
            through: { attributes: [] },
          },
        ],
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      const ratingsMap = new Map(
        baseRows.map((row) => [
          Number.parseInt(row.id, 10),
          {
            averageRating: Number.parseFloat(row.average_rating) || 0,
            reviewCount: Number.parseInt(row.review_count, 10) || 0,
          },
        ])
      );

      const results = ids
        .map((id) => {
          const user = userMap.get(id);
          if (!user) return null;
          const ratingData = ratingsMap.get(id) || { averageRating: 0, reviewCount: 0 };

          return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            image: user.image,
            city: user.city,
            skills: user.skills.map((skill) => ({
              id: skill.id,
              label: skill.label,
              slug: skill.slug,
            })),
            averageRating: ratingData.averageRating,
            reviewCount: ratingData.reviewCount,
          };
        })
        .filter(Boolean);

      return sendApiSuccess(res, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        results,
      });
    } catch (error) {
      logger.error('search_talents_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async autocomplete(req, res) {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (!q) {
        return sendApiSuccess(res, { suggestions: [] });
      }

      const users = await User.findAll({
        attributes: ['id', 'firstname', 'lastname', 'city'],
        where: {
          [Op.or]: [
            { firstname: { [Op.iLike]: `%${q}%` } },
            { lastname: { [Op.iLike]: `%${q}%` } },
          ]
        },
        order: [['firstname', 'ASC']],
        limit: 5,
      });

      return sendApiSuccess(res, {
        suggestions: users.map((user) => ({
          id: user.id,
          fullname: `${user.firstname} ${user.lastname}`,
          city: user.city || '',
        })),
      });
    } catch (error) {
      logger.error('autocomplete_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async saveSearch(req, res) {
    try {
      const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
      const filters = normalizeFilters(req.body.filters || {});

      if (!name) {
        return sendApiError(res, { status: 400, code: 'BAD_REQUEST', message: 'Nom de recherche obligatoire.' });
      }

      const savedSearch = await SavedSearch.create({
        user_id: req.user.id,
        name: name.slice(0, 100),
        filters,
      });

      return sendApiSuccess(res, {
        search: {
          id: savedSearch.id,
          name: savedSearch.name,
          filters: savedSearch.filters,
          createdAt: savedSearch.created_at,
        }
      }, 201);
    } catch (error) {
      logger.error('save_search_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async getSavedSearches(req, res) {
    try {
      const searches = await SavedSearch.findAll({
        where: { user_id: req.user.id },
        attributes: ['id', 'name', 'filters', 'created_at'],
        order: [['created_at', 'DESC']],
      });

      return sendApiSuccess(res, {
        searches: searches.map((search) => ({
          id: search.id,
          name: search.name,
          filters: search.filters,
          createdAt: search.created_at,
        }))
      });
    } catch (error) {
      logger.error('get_saved_searches_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async deleteSavedSearch(req, res) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id <= 0) {
        return sendApiError(res, { status: 400, code: 'BAD_REQUEST', message: 'Identifiant invalide.' });
      }

      const deleted = await SavedSearch.destroy({
        where: {
          id,
          user_id: req.user.id,
        },
      });

      if (!deleted) {
        return sendApiError(res, { status: 404, code: 'NOT_FOUND', message: 'Recherche sauvegardee introuvable.' });
      }

      return sendApiSuccess(res, { success: true });
    } catch (error) {
      logger.error('delete_saved_search_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },
};

export default searchController;
