export type DiagramNode = {
  id: string
  x: number
  y: number
  w: number
  label: string
  sub?: string
}

export type DiagramEdge = {
  from: string
  to: string
  /** id used in step highlights; defaults to `${from}-${to}` */
  id?: string
}

export type Step = {
  id: string
  title: string
  body: string
  /** node and edge ids to light up */
  highlight: string[]
}

export type CaseDiagram = {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  steps: Step[]
}
