export interface CuratedRepo {
  slug: string
  label: string
  lang: string
  description: string
}

export const CURATED_REPOS: CuratedRepo[] = [
  {
    slug: "torvalds/linux",
    label: "Linux Kernel",
    lang: "c",
    description: "The Linux OS kernel",
  },
  {
    slug: "facebook/react",
    label: "React",
    lang: "tsx",
    description: "A JavaScript UI library",
  },
  {
    slug: "ohmyzsh/ohmyzsh",
    label: "Oh My Zsh",
    lang: "sh",
    description: "Zsh framework",
  },
  {
    slug: "microsoft/TypeScript",
    label: "TypeScript",
    lang: "ts",
    description: "JavaScript with types",
  },
  {
    slug: "golang/go",
    label: "Go",
    lang: "go",
    description: "The Go programming language",
  },
  {
    slug: "python/cpython",
    label: "CPython",
    lang: "python",
    description: "Python interpreter",
  },
  {
    slug: "expressjs/express",
    label: "Express.js",
    lang: "js",
    description: "Node.js web framework",
  },
  {
    slug: "vuejs/core",
    label: "Vue.js",
    lang: "ts",
    description: "Progressive JS framework",
  },
  {
    slug: "laravel/framework",
    label: "Laravel",
    lang: "php",
    description: "PHP web framework",
  },
  {
    slug: "rust-lang/rust",
    label: "Rust",
    lang: "rust",
    description: "The Rust programming language",
  },
  {
    slug: "Bash-it/bash-it",
    label: "Bash-it",
    lang: "sh",
    description: "Bash framework & scripts",
  },
  {
    slug: "apple/swift",
    label: "Swift",
    lang: "swift",
    description: "The Swift programming language",
  },
]
