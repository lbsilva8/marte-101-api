import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import { httpCodes } from '../utils/httpCodes';
import { MetricService } from '../services/MetricService';
import { TokenService } from '../services/TokenService';
import { ErrorLogService } from '../services/ErrorLogService';

type JwtPayload = {
  id: number;
};
export class UsersController {
  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Rota para login do usuário
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             example:
   *               email: user@email.com
   *               password: pass123
   *               rememberMe: true
   *             required:
   *               - email
   *               - password
   *               - rememberMe
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               rememberMe:
   *                 type: boolean
   *     responses:
   *       '200':
   *           description: 'Requisição executada com sucesso'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   email:
   *                     type: string
   *                   token:
   *                     type: string
   *       '401':
   *           description: 'Requisição não autorizada'
   */
  async login(req: Request, res: Response) {
    const { email, password, rememberMe } = req.body;
    try {
      const result = await new UserService().authenticate(
        email,
        password,
        rememberMe
      );
      if (result) {
        return res.status(httpCodes.OK).json({
          email: email,
          token: result
        });
      } else {
        return res
          .status(httpCodes.UNAUTHORIZED)
          .json({ mensagem: 'Incorrect username or password' });
      }
    } catch (error) {
      return res
        .status(httpCodes.BAD_REQUEST)
        .json({ error: { message: error.message } });
    }
  }

  /**
   * @swagger
   * /users/logged:
   *   get:
   *     summary: Rota com usuario logado
   *     security:
   *       - BearerAuth: []
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     responses:
   *       '200':
   *           description: 'Acesso a rota autorizado'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: number
   *                   email:
   *                     type: string
   *       '401':
   *           description: 'Acesso a rota negado'
   */
  loggedUser(req: Request, res: Response) {
    return res.status(httpCodes.OK).send({ user: req.body.authUser });
  }

  /**
   * @swagger
   * /users/recover-password:
   *   post:
   *     summary: Rota para redefinir senha do usuário.
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               example:
   *                 email: email@email.com
   *               type: object
   *               properties:
   *                 email:
   *                   type: string
   *     responses:
   *       '204':
   *           description: 'OK'
   *       '400':
   *           description: 'Solicitação inválida'
   */
  async recoverPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await new UserService().recoverPassword(email);
      if (token) {
        await new TokenService().saveToken(token);
      }
      return res.status(httpCodes.NO_CONTENT).send();
    } catch (error) {
      const route: string = '/users/recover-password';
      await new ErrorLogService().insertError(error, route);
      return res
        .status(httpCodes.BAD_REQUEST)
        .json({ error: { message: error.message } });
    }
  }

  /**
   * @swagger
   * /users/new-user:
   *   post:
   *     summary: Rota para criar novo usuário.
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               example:
   *                 firstName: nome
   *                 lastName: sobrenome
   *                 email: email@email.com
   *                 password: 123456A#
   *               type: object
   *               properties:
   *                 firstName:
   *                   type: string
   *                 lastName:
   *                   type: sring
   *                 email:
   *                   type: string
   *                 password:
   *                   type: string
   *     responses:
   *       '201':
   *           description: 'Dados do usuário cadastrado'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   createdAt:
   *                     type: string
   *                   id:
   *                     type: number
   *                   firstName:
   *                     type: string
   *                   lastName:
   *                     type: sring
   *                   email:
   *                     type: string
   *
   *       '400':
   *           description: 'Solicitação inválida.'
   */
  async newUser(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;
    const emailAlreadyInUse = await new UserService().findByEmail(email);
    if (emailAlreadyInUse) {
      return res
        .status(httpCodes.BAD_REQUEST)
        .json({ message: 'Email already in use' });
    }
    const newPassword = await bcrypt.hash(password, 10);
    try {
      const { id, createdAt } = await new UserService().newUser(
        firstName,
        lastName,
        email,
        newPassword
      );
      await new UserService().emailWelcome(email, firstName);
      await new MetricService().registers();
      return res
        .status(httpCodes.CREATED)
        .json({ user: { createdAt, id, firstName, lastName, email } });
    } catch (error) {
<<<<<<< HEAD
      const route: string = '/users/new-user';
      await new ErrorLogService().insertError(error, route);
=======
>>>>>>> eaa9b2d1204ae52ef9eb9ee00747594281dd32eb
      return res
        .status(httpCodes.BAD_REQUEST)
        .json({ error: { message: error.message } });
    }
  }

  /**
   * @swagger
   * /users/token-validation:
   *   post:
   *     summary: Rota para validar o token.
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               example:
   *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiMSIsImlhdCI6MTY5OTQ4MzUxNSwiZXhwIjoxNjk5NTY5OTE1fQ.dNusL_TYB-u617roeRFR1hLjAFPa2NOQTgBvcplrWTw
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *     responses:
   *       '204':
   *           description: 'Acesso autorizado'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: boolean
   *                   data:
   *                     type: object
   *                     description: 'objeto json de retorno'
   *
   *       '401':
   *           description: 'Acesso negado'
   */
  async tokenValidation(req: Request, res: Response) {
    const { token } = req.body;
    try {
      const { id } = jwt.verify(token, process.env.JWT_PASS) as JwtPayload;
      const user = await new UserService().findById(id);
      if (user) {
        return res.status(httpCodes.NO_CONTENT).send();
      }
      return res.status(httpCodes.UNAUTHORIZED).send();
    } catch (error) {
      return res.status(httpCodes.UNAUTHORIZED).json(error);
    }
  }

  /**
   * @swagger
   * /users/password-change:
   *   patch:
   *     summary: Rota para alteração de senha
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             example:
   *               token: token jwt
   *               password: pass@123
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       '204':
   *           description: 'Senha alterada com sucesso.'
   *       '400':
   *           description: 'Senha invalida ou Usuario não encontrado.'
   */
  async updatePassword(req: Request, res: Response) {
    const userService = new UserService();
    const { token, password } = req.body;
    try {
      const { id } = jwt.verify(token, process.env.JWT_PASS) as JwtPayload;
      if (id) {
        const user = userService.findById(id);
        if (user) {
          userService.updatePassword(id, password);
          await new TokenService().removeToken(token);
          return res.status(httpCodes.NO_CONTENT).send();
        } else {
          return res
            .status(httpCodes.UNAUTHORIZED)
            .json({ mensagem: 'User not found.' });
        }
      } else {
        return res
          .status(httpCodes.UNAUTHORIZED)
          .json({ mensagem: 'User not found.' });
      }
    } catch (error) {
      return res
        .status(httpCodes.UNAUTHORIZED)
        .json({ mensagem: 'User not found.' });
    }
  }

  /**
   * @swagger
   * /users/logout:
   *   get:
   *     summary: Rota para fazer o logout
   *     security:
   *       - BearerAuth: []
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     responses:
   *       '204':
   *           description: 'Logout realizado com sucesso'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: boolean
   *                   data:
   *                     type: object
   *                     description: 'objeto json de retorno'
   *       '401':
   *           description: 'Token invalido'
   */
  async userLogout(req: Request, res: Response) {
    const token = req.body.authToken;
    try {
      await new TokenService().removeToken(token);
      return res.status(httpCodes.NO_CONTENT).send();
    } catch (error) {
      return res.status(httpCodes.BAD_REQUEST).json(error);
    }
  }

  /**
   * @swagger
   * /users/email-validation:
   *   post:
   *     summary: Rota para validar o token do e-mail.
   *     tags: [Users]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *         required: true
   *         content:
   *           application/json:
   *             schema:
   *               example:
   *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiMSIsImlhdCI6MTY5OTQ4MzUxNSwiZXhwIjoxNjk5NTY5OTE1fQ.dNusL_TYB-u617roeRFR1hLjAFPa2NOQTgBvcplrWTw
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *     responses:
   *       '204':
   *           description: 'Acesso autorizado'
   *           content:
   *             application/json:
   *               schema:
   *                 type: object
   *                 properties:
   *                   status:
   *                     type: boolean
   *                   data:
   *                     type: object
   *                     description: 'objeto json de retorno'
   *
   *       '401':
   *           description: 'Acesso negado'
   */
  async confirmEmailNewUser(req: Request, res: Response) {
    const { token } = req.body;
    try {
      const { id } = jwt.verify(token, process.env.JWT_PASS) as JwtPayload;
      const user = await new UserService().findById(id);
      if (user) {
        await new UserService().confirmEmail(user);
        await new TokenService().removeToken(token);
        return res.status(httpCodes.NO_CONTENT).send();
      }
      return res.status(httpCodes.UNAUTHORIZED).send();
    } catch (error) {
      return res.status(httpCodes.UNAUTHORIZED).json(error);
    }
  }
}
