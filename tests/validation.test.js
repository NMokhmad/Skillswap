import { describe, test, expect } from '@jest/globals';
import { userCreateSchema, userLoginSchema } from '../app/schemas/user.schema.js';
import { userUpdateSchema } from '../app/schemas/userUpdateSchema.js';

// ─── userCreateSchema (inscription) ───

describe('userCreateSchema', () => {
  const validData = {
    firstname: 'Jean',
    lastname: 'Dupont',
    email: 'jean@example.com',
    password: 'motdepasse123',
    confirmPassword: 'motdepasse123',
  };

  test('accepte des données valides', async () => {
    const result = await userCreateSchema.validateAsync(validData);
    expect(result.firstname).toBe('Jean');
    expect(result.email).toBe('jean@example.com');
  });

  test('rejette un prénom vide', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, firstname: '' })
    ).rejects.toThrow();
  });

  test('rejette un prénom trop court (1 char)', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, firstname: 'A' })
    ).rejects.toThrow();
  });

  test('rejette un prénom trop long (>30 chars)', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, firstname: 'A'.repeat(31) })
    ).rejects.toThrow();
  });

  test('rejette un email invalide', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, email: 'pas-un-email' })
    ).rejects.toThrow();
  });

  test('rejette un email vide', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, email: '' })
    ).rejects.toThrow();
  });

  test('rejette un mot de passe trop court (<6)', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, password: '12345', confirmPassword: '12345' })
    ).rejects.toThrow();
  });

  test('rejette si confirmPassword ne correspond pas', async () => {
    await expect(
      userCreateSchema.validateAsync({ ...validData, confirmPassword: 'autre-mdp' })
    ).rejects.toThrow();
  });

  test('rejette si confirmPassword est absent', async () => {
    const { confirmPassword, ...noConfirm } = validData;
    await expect(
      userCreateSchema.validateAsync(noConfirm)
    ).rejects.toThrow();
  });

  test('rejette si le nom est manquant', async () => {
    const { lastname, ...noLastname } = validData;
    await expect(
      userCreateSchema.validateAsync(noLastname)
    ).rejects.toThrow();
  });

  test('retourne tous les messages d erreur en mode abortEarly: false', async () => {
    try {
      await userCreateSchema.validateAsync(
        { firstname: '', lastname: '', email: '', password: '', confirmPassword: '' },
        { abortEarly: false }
      );
    } catch (error) {
      expect(error.isJoi).toBe(true);
      expect(error.details.length).toBeGreaterThanOrEqual(4);
    }
  });
});

// ─── userLoginSchema ───

describe('userLoginSchema', () => {
  test('accepte des données valides', async () => {
    const result = await userLoginSchema.validateAsync({
      email: 'test@test.com',
      password: 'motdepasse',
    });
    expect(result.email).toBe('test@test.com');
  });

  test('rejette un email invalide', async () => {
    await expect(
      userLoginSchema.validateAsync({ email: 'nope', password: '123456' })
    ).rejects.toThrow();
  });

  test('rejette un mot de passe trop court', async () => {
    await expect(
      userLoginSchema.validateAsync({ email: 'a@b.com', password: '123' })
    ).rejects.toThrow();
  });

  test('rejette si email absent', async () => {
    await expect(
      userLoginSchema.validateAsync({ password: '123456' })
    ).rejects.toThrow();
  });

  test('rejette si password absent', async () => {
    await expect(
      userLoginSchema.validateAsync({ email: 'a@b.com' })
    ).rejects.toThrow();
  });
});

// ─── userUpdateSchema (mise à jour profil) ───

describe('userUpdateSchema', () => {
  test('accepte des données valides', async () => {
    const result = await userUpdateSchema.validateAsync({
      firstname: 'Marie',
      lastname: 'Durand',
      email: 'marie@test.com',
    });
    expect(result.firstname).toBe('Marie');
  });

  test('accepte une mise à jour partielle (un seul champ)', async () => {
    const result = await userUpdateSchema.validateAsync({ firstname: 'Nouveau' });
    expect(result.firstname).toBe('Nouveau');
  });

  test('rejette un prénom trop court', async () => {
    await expect(
      userUpdateSchema.validateAsync({ firstname: 'A' })
    ).rejects.toThrow();
  });

  test('rejette un email invalide', async () => {
    await expect(
      userUpdateSchema.validateAsync({ email: 'pas-valide' })
    ).rejects.toThrow();
  });

  test('accepte un objet vide (rien à mettre à jour)', async () => {
    const result = await userUpdateSchema.validateAsync({});
    expect(result).toEqual({});
  });

  test('rejette un champ non autorisé (mass assignment protection)', async () => {
    await expect(
      userUpdateSchema.validateAsync({ firstname: 'Test', role_id: 1 })
    ).rejects.toThrow();
  });
});
