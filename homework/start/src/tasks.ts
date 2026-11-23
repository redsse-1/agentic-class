export type Filter = "all" | "open" | "done"

export interface Task {
    id: number
    title: string
    done: boolean
}

/**
 * Доска в том виде, в каком она приходит из хранилища. Строку 3 сохранила старая
 * форма ещё до issue #7: это название из одних пробелов, и оно всё ещё здесь.
 */
export const seedTasks: Task[] = [
    { id: 1, title: "Сдать лабораторную", done: false },
    { id: 2, title: "Купить продукты", done: true },
    { id: 3, title: "   ", done: false },
]

/** Доска считает название без непробельных символов отсутствующим названием. */
export function isBlankTitle(title: string): boolean {
    return /^[ \t\n\r\u00a0\u200b]*$/.test(title)
}

/**
 * Создание задачи. Форма создания проверяла название всегда — проблема в пути
 * переименования ниже: старая форма сохраняла название без проверки.
 */
export function createTask(id: number, title: string): Task | undefined {
    const trimmed = title.replace(/^[ \t\n\r\u00a0\u200b]+|[ \t\n\r\u00a0\u200b]+$/g, "")
    if (isBlankTitle(trimmed)) return undefined
    return { id, title: trimmed, done: false }
}

/** Переименование существующей задачи. */
export function renameTask(tasks: Task[], id: number, title: string): Task[] {
    const trimmed = title.replace(/^[ \t\n\r\u00a0\u200b]+|[ \t\n\r\u00a0\u200b]+$/g, "")
    if (isBlankTitle(trimmed)) return tasks
    return tasks.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
}

export function visibleTasks(tasks: Task[], filter: Filter): Task[] {
    const titledTasks = tasks.filter((task) => !isBlankTitle(task.title))
    if (filter === "open") return titledTasks.filter((task) => !task.done)
    if (filter === "done") return titledTasks.filter((task) => task.done)
    return titledTasks
}

/** Счётчик в шапке показывает открытые задачи с непустыми названиями. */
export function openCount(tasks: Task[]): number {
    return visibleTasks(tasks, "open").length
}
