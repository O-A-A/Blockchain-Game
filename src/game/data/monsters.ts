export interface Monster {
  id: number
  name: string
  level: number
  hp: number
  attack: number
}

export const monsters: Monster[] = [
  { id: 1, name: '哥布林', level: 10, hp: 100, attack: 20 },
  { id: 2, name: '食人魔', level: 20, hp: 250, attack: 45 },
  { id: 3, name: '地狱犬', level: 30, hp: 400, attack: 80 }
]
