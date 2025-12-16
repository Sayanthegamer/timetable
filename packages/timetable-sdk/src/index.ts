import { AuthService } from './auth';
import { TimetableAPI } from './api';
import { SocketService } from './socket';

export * from './types';
export * from './auth';
export * from './api';
export * from './socket';

export class TimetableSDK {
  public auth: AuthService;
  public api: TimetableAPI;
  public socket: SocketService;

  constructor(config: { apiUrl?: string; socketUrl?: string } = {}) {
    const apiUrl = config.apiUrl || '/api';
    const socketUrl = config.socketUrl || '/';

    this.auth = new AuthService(apiUrl);
    this.api = new TimetableAPI(apiUrl, () => this.auth.getToken());
    this.socket = new SocketService(socketUrl);
  }

  async initialize(): Promise<void> {
    const user = await this.auth.getCurrentUser();
    if (user && this.auth.getToken()) {
      this.socket.connect(this.auth.getToken()!);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await this.auth.login({ email, password });
    this.socket.connect(response.token);
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const response = await this.auth.register({ email, password, name });
    this.socket.connect(response.token);
  }

  async logout(): Promise<void> {
    this.socket.disconnect();
    await this.auth.logout();
  }
}

export default TimetableSDK;
