import passport from 'passport';
import LocalStrategy from 'passport-local';
import userRepository from '../repositories/citizenRepository.js';

/**
 * Configures Passport authentication
 */
export function configurePassport() {
  // Local strategy for username/password authentication
  passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async function verify(username, password, cb) {
      try {
        const user = await userRepository.verifyCredentials(username, password);
        if (!user) {
          return cb(null, false, { message: 'Invalid username or password' });
        }
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  ));

  // Serialize user to session
  passport.serializeUser((user, cb) => {
    cb(null, { id: user.id, role: user.role });
  });

  // Deserialize user from session
  passport.deserializeUser(async (sessionUser, cb) => {
    try {
      const user = await userRepository.findCitizenById(sessionUser.id);
      if (!user) {
        return cb(null, false);
      }
      cb(null, { ...user, role: sessionUser.role });
    } catch (err) {
      cb(err, null);
    }
  });
}
