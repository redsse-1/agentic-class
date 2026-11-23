import { describe, expect, it } from "vitest"
import { createTask, openCount, renameTask, visibleTasks, seedTasks } from "./tasks"

// Два теста, с которыми поставляется стартер. Они проходят и не покрывают
// поведение, описанное в ISSUE-7.md.
describe("R1 — базовая доска", () => {
    it("создаёт задачу и обрезает название", () => {
        const task = createTask(9, "  Купить хлеб  ")
        expect(task?.title).toBe("Купить хлеб")
    })

    it("отклоняет пустое название при создании и обрезает непустое", () => {
        expect(createTask(1, "  \t ")).toBeUndefined()
        expect(createTask(1, "  A  ")?.title).toBe("A")
    })

    it.each(["   ", "\t", "\u00A0", "  \t\u00A0  "])(
        "оставляет прежнее название при переименовании в пустую строку %j",
        (title) => {
            const tasks = [{ id: 1, title: "Старое", done: false }]
            expect(renameTask(tasks, 1, title)[0].title).toBe("Старое")
        },
    )

    it("обрезает новое название", () => {
        const tasks = [{ id: 1, title: "Старое", done: false }]
        expect(renameTask(tasks, 1, "  Новое  ")[0].title).toBe("Новое")
    })

    it("не меняет другие задачи и длину массива", () => {
        const tasks = [
            { id: 1, title: "Старое", done: false },
            { id: 2, title: "Другое", done: true },
        ]
        const renamed = renameTask(tasks, 1, "Новое")

        expect(renamed[1]).toEqual(tasks[1])
        expect(renamed).toHaveLength(tasks.length)
    })
})

describe("R2 — видимые задачи", () => {
    it("фильтрует готовые задачи", () => {
        expect(visibleTasks(seedTasks, "done").map((task) => task.id)).toEqual([2])
    })

    it.each(["all", "open", "done"] as const)(
        "не показывает пустые задачи в фильтре %s",
        (filter) => {
            expect(
                visibleTasks(seedTasks, filter).some(
                    (task) => task.title.replace(/[ \t\n\r\u00A0]/g, "").length === 0,
                ),
            ).toBe(false)
        },
    )

    it("показывает для фильтра all только задачи с id 1 и 2", () => {
        expect(visibleTasks(seedTasks, "all").map((task) => task.id)).toEqual([1, 2])
    })

    it("скрывает пустую выполненную задачу в фильтре done", () => {
        const tasks = [{ id: 4, title: " \t\u00A0 ", done: true }]
        expect(visibleTasks(tasks, "done")).toEqual([])
    })
})

describe("R3 — счётчик открытых", () => {
    it("не считает унаследованную пустую задачу", () => {
        expect(openCount(seedTasks)).toBe(1)
    })

    it("считает столько же задач, сколько показывает фильтр open", () => {
        const taskSets = [
            seedTasks,
            [],
            [{ id: 1, title: "Открытая", done: false }],
            [
                { id: 1, title: "Открытая", done: false },
                { id: 2, title: " ", done: false },
                { id: 3, title: "Готовая", done: true },
            ],
        ]

        for (const tasks of taskSets) {
            expect(openCount(tasks)).toBe(visibleTasks(tasks, "open").length)
        }
    })
})

describe("R1/R2/R3: U+200B", () => {
    it.each(["\u200B", " \u200B\t"])(
        "оставляет прежнее название при переименовании в пустую строку %j",
        (title) => {
            const tasks = [{ id: 1, title: "Старое", done: false }]
            expect(renameTask(tasks, 1, title)[0].title).toBe("Старое")
        },
    )

    it("отклоняет U+200B при создании", () => {
        expect(createTask(1, "\u200B")).toBeUndefined()
    })

    it.each(["all", "open", "done"] as const)(
        "не показывает задачу с названием U+200B в фильтре %s",
        (filter) => {
            const tasks = [
                { id: 1, title: "\u200B", done: false },
                { id: 2, title: "\u200B", done: true },
            ]
            expect(visibleTasks(tasks, filter)).toEqual([])
        },
    )

    it("не считает задачи с названием U+200B", () => {
        const tasks = [
            { id: 1, title: "\u200B", done: false },
            { id: 2, title: "\u200B", done: true },
        ]
        expect(openCount(tasks)).toBe(0)
    })
})
