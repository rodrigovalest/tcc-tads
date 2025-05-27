import IUsuarioResponse from "@/models/responses/user-response";

export default interface ILoginResponse {
  //   access_token: string;
  //   token_type: string;
  usuario: IUsuarioResponse;
}
