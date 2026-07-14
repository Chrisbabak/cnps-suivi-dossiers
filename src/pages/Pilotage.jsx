// ---------------------------------------------------------------------------
// Page "Pilotage" : indicateurs clés, camemberts, courbe de tendance et
// barres horizontales — calculés en direct à partir des dossiers, sans
// librairie de graphiques (SVG écrit à la main, couleurs charte CNPS).
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { delaiEnJours } from '../lib/dates.js'
import { STATUTS, CANAUX, REGION_PAR_AGENCE } from '../lib/constants.js'
import { PALETTE_CNPS, COULEURS_STATUT } from '../lib/couleurs.js'

// --- Composants graphiques ---------------------------------------------------

// Carte KPI avec liseré de couleur (charte CNPS).
function Kpi({ libelle, valeur, detail, couleur = '#2F9E41' }) {
  return (
    <div className="rounded-lg border-l-4 bg-white p-4 shadow" style={{ borderLeftColor: couleur }}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{valeur}</p>
      {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
    </div>
  )
}

// Jauge circulaire (anneau) pour le KPI "% dans les délais".
function KpiJauge({ libelle, pct, detail }) {
  const rayon = 26
  const circonference = 2 * Math.PI * rayon
  const part = pct == null ? 0 : Math.max(0, Math.min(100, pct)) / 100
  const couleur = pct == null ? '#9CA3AF' : pct >= 80 ? '#2F9E41' : pct >= 50 ? '#A87900' : '#C2410C'
  return (
    <div className="flex items-center gap-3 rounded-lg border-l-4 bg-white p-4 shadow" style={{ borderLeftColor: couleur }}>
      <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" role="img" aria-label={`${libelle} : ${pct == null ? 'non applicable' : `${pct} %`}`}>
        <circle cx="32" cy="32" r={rayon} fill="none" stroke="#E5E7EB" strokeWidth="7" />
        <circle
          cx="32" cy="32" r={rayon} fill="none" stroke={couleur} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={`${part * circonference} ${circonference}`}
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill="#111827">
          {pct == null ? '—' : `${pct}`}
        </text>
      </svg>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{libelle}</p>
        <p className="mt-0.5 text-lg font-bold text-gray-900">{pct == null ? '—' : `${pct} %`}</p>
        {detail && <p className="text-xs text-gray-500">{detail}</p>}
      </div>
    </div>
  )
}

// Convertit un angle (degrés, 0 = midi) en point sur le cercle.
function pointCercle(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

// Chemin SVG d'une part de camembert entre deux angles.
function cheminSecteur(cx, cy, r, a0, a1) {
  const [x0, y0] = pointCercle(cx, cy, r, a0)
  const [x1, y1] = pointCercle(cx, cy, r, a1)
  const grandArc = a1 - a0 > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${grandArc} 1 ${x1} ${y1} Z`
}

// Camembert (donut) avec légende : donnees = [{ label, valeur, couleur }].
function Camembert({ titre, donnees, uniteCentre = 'dossiers' }) {
  const total = donnees.reduce((somme, d) => somme + d.valeur, 0)
  let angle = 0
  const secteurs = donnees
    .filter((d) => d.valeur > 0)
    .map((d) => {
      const a0 = angle
      angle += (d.valeur / total) * 360
      return { ...d, a0, a1: angle }
    })

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">{titre}</h2>
      {total === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée</p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0" role="img" aria-label={titre}>
            {secteurs.length === 1 ? (
              <circle cx="60" cy="60" r="54" fill={secteurs[0].couleur}>
                <title>{`${secteurs[0].label} : ${secteurs[0].valeur} (100 %)`}</title>
              </circle>
            ) : (
              secteurs.map((s) => (
                <path
                  key={s.label}
                  d={cheminSecteur(60, 60, 54, s.a0, s.a1)}
                  fill={s.couleur}
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <title>{`${s.label} : ${s.valeur} (${Math.round((100 * s.valeur) / total)} %)`}</title>
                </path>
              ))
            )}
            {/* Trou central : le camembert devient un donut, avec le total au centre */}
            <circle cx="60" cy="60" r="33" fill="#fff" />
            <text x="60" y="58" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">
              {total}
            </text>
            <text x="60" y="73" textAnchor="middle" fontSize="8.5" fill="#6B7280">
              {uniteCentre}
            </text>
          </svg>
          <ul className="min-w-[9rem] flex-1 space-y-1.5">
            {donnees.map((d) => (
              <li key={d.label} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: d.couleur }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-gray-700">{d.label}</span>
                <span className="font-semibold text-gray-900">{d.valeur}</span>
                <span className="w-9 text-right text-gray-400">
                  {total > 0 ? `${Math.round((100 * d.valeur) / total)} %` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Courbe de tendance : dossiers reçus par semaine (8 dernières semaines).
// Toute la colonne d'une semaine est survolable : une info-bulle affiche
// le nombre de dossiers reçus cette semaine-là.
function TendanceHebdo({ dossiers }) {
  const [survol, setSurvol] = useState(null) // index de la semaine survolée

  const semaines = useMemo(() => {
    const lundiDe = (date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      return d
    }
    const resultat = []
    const lundiCourant = lundiDe(new Date())
    for (let i = 7; i >= 0; i--) {
      const debut = new Date(lundiCourant)
      debut.setDate(debut.getDate() - i * 7)
      const fin = new Date(debut)
      fin.setDate(fin.getDate() + 7)
      const compte = dossiers.filter((d) => {
        const recu = new Date(`${d.dateReception}T00:00:00`)
        return recu >= debut && recu < fin
      }).length
      resultat.push({
        label: `${String(debut.getDate()).padStart(2, '0')}/${String(debut.getMonth() + 1).padStart(2, '0')}`,
        compte,
      })
    }
    return resultat
  }, [dossiers])

  const max = Math.max(...semaines.map((s) => s.compte), 1)
  const L = 560
  const H = 160
  const margeGauche = 24 // place pour les graduations de l'axe vertical
  const margeDroite = 10
  const margeHaut = 14
  const margeBas = 24
  const largeurTrace = L - margeGauche - margeDroite
  const hauteurTrace = H - margeHaut - margeBas
  const largeurColonne = largeurTrace / (semaines.length - 1)

  const x = (i) => margeGauche + (i / (semaines.length - 1)) * largeurTrace
  const y = (v) => margeHaut + (1 - v / max) * hauteurTrace
  const points = semaines.map((s, i) => [x(i), y(s.compte)])
  const ligne = points.map(([px, py]) => `${px},${py}`).join(' ')
  const aire = `M ${points[0][0]} ${H - margeBas} L ${ligne.replaceAll(',', ' ')} L ${points[points.length - 1][0]} ${H - margeBas} Z`

  // Graduations entières de l'axe vertical (toutes si peu, sinon ~4 paliers).
  const pas = max <= 6 ? 1 : Math.ceil(max / 4)
  const graduations = []
  for (let v = pas; v <= max; v += pas) graduations.push(v)

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-1 text-sm font-semibold text-gray-800">
        Dossiers reçus par semaine (8 dernières semaines)
      </h2>
      <div className="relative">
        <svg viewBox={`0 0 ${L} ${H}`} className="w-full" role="img" aria-label="Évolution hebdomadaire des dossiers reçus">
          {/* Axe vertical : graduations en nombre de dossiers */}
          {graduations.map((v) => (
            <g key={v}>
              <line x1={margeGauche} y1={y(v)} x2={L - margeDroite} y2={y(v)} stroke="#F3F4F6" strokeWidth="1" />
              <text x={margeGauche - 5} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#9CA3AF">
                {v}
              </text>
            </g>
          ))}
          {/* Ligne de base (0) */}
          <line x1={margeGauche} y1={H - margeBas} x2={L - margeDroite} y2={H - margeBas} stroke="#E5E7EB" strokeWidth="1" />
          <text x={margeGauche - 5} y={H - margeBas + 3} textAnchor="end" fontSize="9" fill="#9CA3AF">
            0
          </text>
          {/* Aire + ligne (vert CNPS) */}
          <path d={aire} fill="#2F9E41" opacity="0.12" />
          <polyline points={ligne} fill="none" stroke="#2F9E41" strokeWidth="2" strokeLinejoin="round" />
          {/* Points, repère de survol et étiquettes de semaines */}
          {semaines.map((s, i) => (
            <g key={s.label}>
              {survol === i && (
                <line x1={x(i)} y1={margeHaut} x2={x(i)} y2={H - margeBas} stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3 3" />
              )}
              <circle
                cx={x(i)}
                cy={y(s.compte)}
                r={survol === i ? 6 : 4.5}
                fill="#2F9E41"
                stroke="#fff"
                strokeWidth="2"
              />
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={survol === i ? '#111827' : '#6B7280'} fontWeight={survol === i ? '700' : '400'}>
                {s.label}
              </text>
              {/* Zone de survol : toute la colonne de la semaine */}
              <rect
                x={x(i) - largeurColonne / 2}
                y={0}
                width={largeurColonne}
                height={H}
                fill="transparent"
                onMouseEnter={() => setSurvol(i)}
                onMouseLeave={() => setSurvol(null)}
              >
                <title>{`Semaine du ${s.label} : ${s.compte} dossier(s) reçu(s)`}</title>
              </rect>
            </g>
          ))}
        </svg>
        {/* Info-bulle */}
        {survol != null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${(x(survol) / L) * 100}%`,
              top: `${((y(semaines[survol].compte) - 10) / H) * 100}%`,
            }}
          >
            Semaine du {semaines[survol].label} :{' '}
            <strong>
              {semaines[survol].compte} dossier{semaines[survol].compte > 1 ? 's' : ''}
            </strong>
          </div>
        )}
      </div>
    </div>
  )
}

// Liste de barres horizontales (répartition par catégorie, vert CNPS).
function Repartition({ titre, donnees }) {
  const max = Math.max(...donnees.map((d) => d.valeur), 1)
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">{titre}</h2>
      {donnees.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune donnée</p>
      ) : (
        <ul className="space-y-2">
          {donnees.map(({ label, valeur }) => (
            <li key={label} title={`${label} : ${valeur}`}>
              <div className="mb-0.5 flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate text-gray-700">{label}</span>
                <span className="font-semibold text-gray-900">{valeur}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`${label} : ${valeur}`}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(valeur / max) * 100}%`, backgroundColor: '#2F9E41' }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Compte les dossiers par valeur d'un champ, trié par effectif décroissant.
function compterPar(dossiers, champ) {
  const compteur = new Map()
  for (const d of dossiers) {
    const cle = d[champ] || '(non renseigné)'
    compteur.set(cle, (compteur.get(cle) || 0) + 1)
  }
  return [...compteur.entries()]
    .map(([label, valeur]) => ({ label, valeur }))
    .sort((a, b) => b.valeur - a.valeur)
}

// --- Page ---------------------------------------------------------------------

export default function Pilotage() {
  const { dossiers, settings } = useData()

  const stats = useMemo(() => {
    const cible = settings.delaiCible
    const clotures = dossiers.filter((d) => d.statut === 'Clôturé')
    const ouverts = dossiers.filter((d) => d.statut !== 'Clôturé')

    const delais = clotures.map(delaiEnJours)
    const delaiMoyen =
      delais.length > 0 ? delais.reduce((somme, x) => somme + x, 0) / delais.length : null

    const dansLesDelais = clotures.filter((d) => delaiEnJours(d) <= cible).length
    const pctDansDelais =
      clotures.length > 0 ? Math.round((100 * dansLesDelais) / clotures.length) : null

    const compterValeur = (liste, champ, valeurCherchee) =>
      liste.filter((d) => d[champ] === valeurCherchee).length

    return {
      total: dossiers.length,
      ouverts: ouverts.length,
      clotures: clotures.length,
      delaiMoyen,
      pctDansDelais,
      reclamations: dossiers.filter((d) => d.type === 'Réclamation').length,
      // Camemberts : ordre FIXE des catégories → couleur stable par catégorie.
      parStatut: STATUTS.map((s) => ({
        label: s,
        valeur: compterValeur(dossiers, 'statut', s),
        couleur: COULEURS_STATUT[s],
      })),
      parCanal: CANAUX.map((c, i) => ({
        label: c,
        valeur: compterValeur(dossiers, 'canal', c),
        couleur: PALETTE_CNPS[i % PALETTE_CNPS.length],
      })),
      parMotif: compterPar(dossiers, 'motif'),
      parAgence: compterPar(dossiers, 'agence'),
      parRegion: compterPar(
        dossiers.map((d) => ({ region: REGION_PAR_AGENCE[d.agence] || 'Autre' })),
        'region',
      ),
      chargeParAgent: compterPar(ouverts, 'agent'),
    }
  }, [dossiers, settings.delaiCible])

  if (dossiers.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-10 text-center">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Pilotage</h1>
        <p className="text-sm text-gray-500">
          Aucun dossier pour le moment — les indicateurs apparaîtront dès la première saisie.{' '}
          <Link to="/dossiers" className="text-cnps-600 underline">
            Aller aux dossiers
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Pilotage</h1>

      {/* Indicateurs clés (liserés aux couleurs de la charte CNPS) */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi libelle="Total dossiers" valeur={stats.total} couleur="#3B5BC4" />
        <Kpi libelle="En cours" valeur={stats.ouverts} detail="non clôturés" couleur="#A87900" />
        <Kpi libelle="Clôturés" valeur={stats.clotures} couleur="#2F9E41" />
        <Kpi
          libelle="Délai moyen"
          valeur={stats.delaiMoyen == null ? '—' : `${stats.delaiMoyen.toFixed(1)} j`}
          detail="de clôture"
          couleur="#C96A06"
        />
        <div className="col-span-2 sm:col-span-1">
          <KpiJauge
            libelle="Dans les délais"
            pct={stats.pctDansDelais}
            detail={`cible : ${settings.delaiCible} jours`}
          />
        </div>
        <Kpi libelle="Réclamations" valeur={stats.reclamations} couleur="#7C4DBE" />
      </div>

      {/* Tendance hebdomadaire */}
      <div className="mb-4">
        <TendanceHebdo dossiers={dossiers} />
      </div>

      {/* Camemberts */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Camembert titre="Répartition par statut" donnees={stats.parStatut} />
        <Camembert titre="Répartition par canal" donnees={stats.parCanal} />
      </div>

      {/* Barres horizontales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        <Repartition titre="Par motif" donnees={stats.parMotif} />
        <Repartition titre="Par région" donnees={stats.parRegion} />
        <Repartition titre="Par agence" donnees={stats.parAgence} />
        <Repartition titre="Charge par agent (dossiers ouverts)" donnees={stats.chargeParAgent} />
      </div>
    </div>
  )
}
