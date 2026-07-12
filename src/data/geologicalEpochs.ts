export interface GeologicalEpoch {
  ma: number
  label: string
  cor: string
  periodo: string
}

export const GEOLOGICAL_EPOCHS: GeologicalEpoch[] = [
  { ma: 541, label: 'Cambriano',     cor: '#7ec850', periodo: 'Paleozoico' },
  { ma: 485, label: 'Ordoviciano',   cor: '#009270', periodo: 'Paleozoico' },
  { ma: 443, label: 'Siluriano',     cor: '#b3e1b6', periodo: 'Paleozoico' },
  { ma: 419, label: 'Devoniano',     cor: '#cb8c37', periodo: 'Paleozoico' },
  { ma: 359, label: 'Carbonífero',   cor: '#67a599', periodo: 'Paleozoico' },
  { ma: 299, label: 'Permiano',      cor: '#f04028', periodo: 'Paleozoico' },
  { ma: 252, label: 'Triássico',     cor: '#812b92', periodo: 'Mesozoico' },
  { ma: 201, label: 'Jurássico',     cor: '#34b2c9', periodo: 'Mesozoico' },
  { ma: 145, label: 'Cretáceo',      cor: '#7fc64e', periodo: 'Mesozoico' },
  { ma: 66,  label: 'Paleógeno',     cor: '#fd9a52', periodo: 'Cenozoico' },
  { ma: 23,  label: 'Neógeno',       cor: '#ffff00', periodo: 'Cenozoico' },
  { ma: 2.6, label: 'Quaternário',   cor: '#f9f97f', periodo: 'Cenozoico' },
  { ma: 0,   label: 'Presente',      cor: '#f9f97f', periodo: 'Cenozoico' },
]

export const PALEO_SNAPSHOTS = [0, 5, 10, 20, 50, 66, 100, 150, 200, 252, 300, 359, 443, 485, 541]
