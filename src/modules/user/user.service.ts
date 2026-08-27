import { UserRepository } from "./user.repository";
import { getUserProfileResponse, type GetUserProfileRes } from "./user.types";
import { NotFoundError } from "../../errors/app.error";

export class UserService {
  static async getProfile(userId: string): Promise<GetUserProfileRes> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Pengguna tidak ditemukan");
    }

    return getUserProfileResponse(user);
  }
}
