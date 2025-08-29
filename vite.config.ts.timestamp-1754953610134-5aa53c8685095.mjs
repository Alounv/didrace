// vite.config.ts
import { defineConfig } from "file:///Users/alounvangkeosay/dev/didrace/node_modules/vite/dist/node/index.js";
import solid from "file:///Users/alounvangkeosay/dev/didrace/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import tailwindcss from "file:///Users/alounvangkeosay/dev/didrace/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        "top-level-await": true
      }
    }
  },
  esbuild: {
    supported: {
      "top-level-await": true
    }
  },
  plugins: [
    tailwindcss(),
    solid()
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3210",
        changeOrigin: true,
        bypass: (req, res, options) => {
          if (req.url?.startsWith("/api/discord")) {
            return req.url;
          }
          return null;
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxvdW52YW5na2Vvc2F5L2Rldi9kaWRyYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWxvdW52YW5na2Vvc2F5L2Rldi9kaWRyYWNlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hbG91bnZhbmdrZW9zYXkvZGV2L2RpZHJhY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHNvbGlkIGZyb20gXCJ2aXRlLXBsdWdpbi1zb2xpZFwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgc3VwcG9ydGVkOiB7XG4gICAgICAgIFwidG9wLWxldmVsLWF3YWl0XCI6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgIFwidG9wLWxldmVsLWF3YWl0XCI6IHRydWUsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHRhaWx3aW5kY3NzKCksXG4gICAgc29saWQoKSxcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vMTI3LjAuMC4xOjMyMTBcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBieXBhc3M6IChyZXEsIHJlcywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgIC8vIERvbid0IHByb3h5IERpc2NvcmQgT0F1dGggY2FsbGJhY2sgLSBoYW5kbGUgaXQgaW4gZnJvbnRlbmRcbiAgICAgICAgICBpZiAocmVxLnVybD8uc3RhcnRzV2l0aCgnL2FwaS9kaXNjb3JkJykpIHtcbiAgICAgICAgICAgIHJldHVybiByZXEudXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3UixTQUFTLG9CQUFvQjtBQUNyVCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsUUFDVCxtQkFBbUI7QUFBQSxNQUNyQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxtQkFBbUI7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRLENBQUMsS0FBSyxLQUFLLFlBQVk7QUFFN0IsY0FBSSxJQUFJLEtBQUssV0FBVyxjQUFjLEdBQUc7QUFDdkMsbUJBQU8sSUFBSTtBQUFBLFVBQ2I7QUFDQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
