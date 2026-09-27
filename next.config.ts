import type { NextConfig } from "next";

// GitHub Pages에 올릴 때만 켜지는 설정입니다. (배포용 자동 빌드에서 GITHUB_PAGES=true 로 실행)
// 내 컴퓨터에서 npm run dev 로 실행할 때는 적용되지 않아요.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export", // 서버 없이 올릴 수 있는 HTML 파일들로 만들기 (out 폴더)
      basePath: "/help_read", // 주소가 https://xieva.github.io/help_read/ 이므로
      trailingSlash: true, // /library → /library/index.html 형태로 만들어 GitHub Pages와 잘 맞게
    }
  : {};

export default nextConfig;
