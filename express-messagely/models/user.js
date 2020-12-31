/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");
/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    let hashedPass = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `
        INSERT INTO users (
          username, 
          password, 
          first_name, 
          last_name, 
          phone, 
          join_at, 
          last_login_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPass, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    if (!username || !password) {
      throw new ExpressError("Username and Password required.", 400);
    }
    const result = await db.query(
      `SELECT username, password 
      FROM users 
      WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        return true;
      }
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `
    UPDATE users 
    SET last_login_at = current_timestamp
    WHERE username = $1
    RETURNING username,first_name,last_name,phone`,
      [username]
    );
    return;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(`
    SELECT username, first_name, last_name, phone
    FROM users`);
    if (!result) {
      throw new ExpressError("Something went worng", 500);
    }
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `
    SELECT username,first_name,last_name,phone,join_at,last_login_at
    FROM users 
    WHERE username = $1 
    `,
      [username]
    );
    if (!result) {
      throw new ExpressError("Couldn't find user", 401);
    }
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `
    SELECT m.id,
    m.body,
    m.to_username,
    m.sent_at,
    m.read_at,
    u.username,
    u.first_name,
    u.last_name,
    u.phone 
    FROM messages as m
    JOIN users AS u ON m.to_username = u.username
    WHERE from_username = $1`,
      [username]
    );

    let resultsList = result.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
    return resultsList;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `
    SELECT m.id,
    m.body,
    m.from_username,
    m.sent_at,
    m.read_at,
    u.username,
    u.first_name,
    u.last_name,
    u.phone 
    FROM messages as m
    JOIN users AS u ON m.from_username = u.username
    WHERE to_username = $1`,
      [username]
    );
    let resultsList = result.rows.map((m) => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
    return resultsList;
  }
}

module.exports = User;
