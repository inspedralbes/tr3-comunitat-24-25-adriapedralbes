// .eslintrc.js para proyecto Next.js con TypeScript
// Configuración basada en las reglas más populares y buenas prácticas

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    // Configuraciones base
    "eslint:recommended",
    "next/core-web-vitals", // Configuración oficial de Next.js con reglas optimizadas
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier", // Debe ir al final para evitar conflictos
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json", // Asegúrate de tener un tsconfig.json
  },
  plugins: ["react", "react-hooks", "@typescript-eslint", "jsx-a11y", "import"],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "warn", // Evita el uso de 'any'
    "@typescript-eslint/explicit-function-return-type": "off", // Opcional: activar si quieres tipos de retorno explícitos
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-empty-interface": "warn",

    // React
    "react/react-in-jsx-scope": "off", // No necesario en Next.js
    "react/prop-types": "off", // No necesario con TypeScript
    "react/jsx-key": "error", // Elementos en listas deben tener key
    "react-hooks/rules-of-hooks": "error", // Verifica reglas de Hooks
    "react-hooks/exhaustive-deps": "warn", // Comprueba dependencias en useEffect/useCallback

    // Next.js
    "@next/next/no-img-element": "warn", // Sugiere usar next/image
    "@next/next/no-html-link-for-pages": "warn", // Recomienda usar next/link

    // Importaciones
    "import/order": [
      "warn",
      {
        groups: [
          "builtin", // Módulos incorporados de Node.js
          "external", // Paquetes npm
          "internal", // Importaciones internas del proyecto
          ["parent", "sibling"], // Importaciones relativas
          "index", // Importaciones del mismo archivo
          "object", // Importaciones de tipo objeto
          "type", // Importaciones de tipos
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unresolved": "error",

    // Accesibilidad
    "jsx-a11y/alt-text": "warn", // Requiere texto alternativo en imágenes
    "jsx-a11y/anchor-is-valid": "warn", // Verifica uso correcto de enlaces

    // Reglas de formato y estilo
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "prefer-const": "warn",
    "no-unused-expressions": "warn",
    "no-duplicate-imports": "error",
  },
  // Reglas específicas para archivos de prueba
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "react-hooks/rules-of-hooks": "off",
      },
    },
  ],
};
