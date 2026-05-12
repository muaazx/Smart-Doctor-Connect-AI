import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { motion } from "motion/react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-full w-10 h-10 overflow-hidden bg-slate-100 dark:bg-slate-800 transition-colors"
    >
      <motion.div
        initial={false}
        animate={{
          y: theme === "light" ? 0 : 40,
          opacity: theme === "light" ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          y: theme === "dark" ? 0 : -40,
          opacity: theme === "dark" ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
