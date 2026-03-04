const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface PostData {
  post_id: string;
  thread_name: string;
  author_name: string;
  title: string;
  content: string;
  media_url: string;
  media?: string; // base64 encoded bytes
  created_at: string;
  likes_count: number;
  comments_count: number;
}

export interface GetPostsResponse {
  posts: PostData[];
  total: number;
}

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  repeat_password: string;
}

export interface RegisterUserResponse {
  confirmed: boolean;
  message: string;
}

export interface SendVerifyCodeRequest {
  email: string;
}

export interface SendVerifyCodeResponse {
  message: string;
}

export interface ConfirmVerifyCodeRequest {
  code: number;
}

export interface ConfirmVerifyCodeResponse {
  confirmed: boolean;
  message: string;
}

export interface LoginUserRequest {
  username: string;
  password: string;
}

export interface LoginUserResponse {
  confirmed: boolean;
  message: string;
  role?: string;
}

export interface CurrentUserResponse {
  user_id: string;
  username: string;
  role: string;
}

export interface SetUserRoleRequest {
  user_id: string;
  role: string;
}

export interface SetUserRoleResponse {
  success: boolean;
  message: string;
}

export interface LogoutUserResponse {
  message: string;
}

export interface CreatePostRequest {
  thread: string;
  title: string;
  content: string;
  media?: string; // base64 encoded string
}

export interface CreatePostResponse {
  message: string;
  post_id: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      try {
        const text = await response.text();
        errorMessage = text || errorMessage;
      } catch {}
    }
    throw new ApiError(errorMessage, response.status);
  }
  try {
    return await response.json();
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    throw new ApiError("Invalid response from server", response.status);
  }
};

export const apiClient = {
  async getPosts(limit: number = 10, offset: number = 0): Promise<GetPostsResponse> {
    const url = `${API_BASE_URL}/api/v1/post/posts?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse(response);
  },

  async registerUser(data: RegisterUserRequest): Promise<RegisterUserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async sendVerifyCode(data: SendVerifyCodeRequest): Promise<SendVerifyCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/send_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async confirmVerifyCode(data: ConfirmVerifyCodeRequest): Promise<ConfirmVerifyCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/confirm_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async loginUser(data: LoginUserRequest): Promise<LoginUserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async logoutUser(): Promise<LogoutUserResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse(response);
  },

  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    const requestBody: Record<string, unknown> = {
      thread: data.thread,
      title: data.title,
      content: data.content,
    };
    if (data.media) {
      requestBody.media = data.media;
    }
    const response = await fetch(`${API_BASE_URL}/api/v1/post/create_post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });
    return handleResponse(response);
  },

  async getMe(): Promise<CurrentUserResponse | null> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    if (response.status === 401) return null;
    if (!response.ok) throw new ApiError(await response.text(), response.status);
    return handleResponse(response);
  },

  async deletePost(postId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/post/${postId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse(response);
  },

  async deleteThread(threadId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/post/thread/${threadId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return handleResponse(response);
  },

  async setUserRole(data: SetUserRoleRequest): Promise<SetUserRoleResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/set_role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export { ApiError };
