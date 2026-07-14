package es.udc.tfg.scanticket.model.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import es.udc.tfg.scanticket.model.services.exceptions.IncorrectLoginException;
import es.udc.tfg.scanticket.model.services.exceptions.IncorrectPasswordException;
import es.udc.tfg.scanticket.model.services.exceptions.InvalidPasswordResetTokenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.udc.tfg.scanticket.model.common.exceptions.DuplicateInstanceException;
import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.entities.UserDao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The Class UserServiceImpl.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

	/** The permission checker. */
	@Autowired
	private PermissionChecker permissionChecker;

	/** The password encoder. */
	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	/** The user dao. */
	@Autowired
	private UserDao userDao;

	@Autowired
	private EmailService emailService;

	private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

	/**
	 * Sign up.
	 *
	 * @param user the user
	 * @throws DuplicateInstanceException the duplicate instance exception
	 */
	@Override
	public void signUp(User user) throws DuplicateInstanceException {

		if (userDao.existsByUserName(user.getUserName())) {
			throw new DuplicateInstanceException("project.entities.user", user.getUserName());
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		user.setRole(User.RoleType.USER);

		userDao.save(user);

	}

	/**
	 * Login.
	 *
	 * @param userName the user name
	 * @param password the password
	 * @return the user
	 * @throws IncorrectLoginException the incorrect login exception
	 */
	@Override
	@Transactional(readOnly = true)
	public User login(String userName, String password) throws IncorrectLoginException {

		Optional<User> user = userDao.findByUserName(userName);

		if (!user.isPresent()) {
			throw new IncorrectLoginException(userName, password);
		}

		if (!passwordEncoder.matches(password, user.get().getPassword())) {
			throw new IncorrectLoginException(userName, password);
		}

		return user.get();

	}

	/**
	 * Login from id.
	 *
	 * @param id the id
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	@Transactional(readOnly = true)
	public User loginFromId(Long id) throws InstanceNotFoundException {
		return permissionChecker.checkUser(id);
	}

	/**
	 * Update profile.
	 *
	 * @param id        the id
	 * @param firstName the first name
	 * @param lastName  the last name
	 * @param email     the email
	 * @return the user
	 * @throws InstanceNotFoundException the instance not found exception
	 */
	@Override
	public User updateProfile(Long id, String firstName, String lastName, String email)
			throws InstanceNotFoundException {

		User user = permissionChecker.checkUser(id);

		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setEmail(email);

		return user;

	}

	/**
	 * Change password.
	 *
	 * @param id          the id
	 * @param oldPassword the old password
	 * @param newPassword the new password
	 * @throws InstanceNotFoundException  the instance not found exception
	 * @throws IncorrectPasswordException the incorrect password exception
	 */
	@Override
	public void changePassword(Long id, String oldPassword, String newPassword)
			throws InstanceNotFoundException, IncorrectPasswordException {

		User user = permissionChecker.checkUser(id);

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IncorrectPasswordException();
		} else {
			user.setPassword(passwordEncoder.encode(newPassword));
		}

	}

	@Override
	public void requestPasswordReset(String email) throws InstanceNotFoundException {

		logger.info("=== PASSWORD RESET REQUEST ===");
		logger.info("Searching for email: '{}'", email);
		Optional<User> user = userDao.findByEmail(email);
		logger.info("User found: {}", user.isPresent());
		if (user.isEmpty()) {
			throw new InstanceNotFoundException("project.entities.user", email);
		}
		logger.info("User found: {}", user.get().getUserName());
		String resetToken = generatePasswordResetToken();
		User u = user.get();
		u.setPasswordResetToken(resetToken);
		u.setPasswordResetTokenExpiration(LocalDateTime.now().plusHours(1));

		userDao.save(u);

		String resetLink = "http://localhost:3000/#/reset-password?token=" + resetToken;
		emailService.sendPasswordResetEmail(email, resetLink);
	}

	@Override
	public void resetPassword(String token, String newPassword) throws InvalidPasswordResetTokenException {

		Optional<User> user = userDao.findByPasswordResetToken(token);

		if (user.isEmpty()) {
			throw new InvalidPasswordResetTokenException(token);
		}

		User u = user.get();

		if (u.getPasswordResetTokenExpiration() == null ||
				LocalDateTime.now().isAfter(u.getPasswordResetTokenExpiration())) {
			throw new InvalidPasswordResetTokenException(token);
		}

		u.setPassword(passwordEncoder.encode(newPassword));
		u.setPasswordResetToken(null);
		u.setPasswordResetTokenExpiration(null);

		userDao.save(u);
	}

	private String generatePasswordResetToken() {
		return UUID.randomUUID().toString();
	}

}
