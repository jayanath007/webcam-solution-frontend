export interface PeerData {
  id: string;
  data: any;
}

export interface UserInfo {
  userName?: string;
  connectionId: string;
}

export interface UserAction extends  UserInfo {
  action: string;
}

export interface SignalInfo {
  user: string;
  signal: any;
}

export interface ChatMessage {
  own: boolean;
  message: string;
}

export interface IncomingCallInfor {
  callFrom: string;
  userTocall: string;
  signal: string;
  callFromUserName: string;
}


