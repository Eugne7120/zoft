# DESIGN.md — zOFT Protocol (`$ZOFT` / `zoft.finance`)
**Design System, 3D WebGL Architecture & Spatial UI Specification**

---

## 1. Design Philosophy & Aesthetic Direction

- **Taxonomy & Domain**: `web3_defi_protocol_platform` × `spatial_3d_circuit_builder`
- **Primary Aesthetic Persona**: **Cryptographic Noir Brutalism & Tactile Modular Engineering**
- **Reference Exemplars**:
  1. **LayerZero V2 (`layerzero.network`)**: Monochromatic obsidian-and-stark-white discipline, technical dot-matrix canvases, hairline structural borders (`1px solid rgba(255, 255, 255, 0.10)`), and zero decorative Web3 neon clutter.
  2. **Hookr.fun (`hookr.fun/builder`)**: Tactile 3D spatial circuit board, central U-shaped 3D chamber surrounded by lifecycle node ports, and interactive **3D Isometric Segmented Bricks** that synchronize directly with real-time protocol parameters.
  3. **Aztec / Zcash Cryptography Engineering**: High-trust cryptographic telemetry (`0x...` Pedersen/Poseidon commitments, nullifier hashes, Viewing Keys, and `0xbow ASP` Proof of Association indicators).

---

## 2. Color Palette & Surface Tokens (LayerZero Monochrome System)

Protokol ini menggunakan pendekatan **Intentional Dark Mode (Obsidian Monochrome)** di mana sekitar **90% permukaan UI** menggunakan spektrum hitam obsidian, abu-abu grafit, dan putih tajam. Warna aksen hanya digunakan sebagai indikator semantik status kriptografi.

### 2.1 Surface & Background Hierarchy
| Token Name | Hex / Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas-obsidian` | `#070709` | Latar belakang utama halaman (`/` dan `/app`). |
| `--bg-reactor-void` | `#08090c` | Kanvas dot-matrix di belakang diagram sirkuit 3D (`Your zOFT Circuit Board`). |
| `--bg-surface-primary` | `#0d0e12` | Kartu utama, kontainer sesi, dan panel inspektor. |
| `--bg-surface-elevated` | `#12141b` | Sub-kartu, baris akordion aktif, dan kartu *Input/Output UTXO Notes*. |
| `--bg-surface-interactive` | `#161820` | Tombol sekunder, *dropdown*, dan kontrol *toggle*. |
| `--bg-glass-header` | `rgba(7, 7, 9, 0.95)` | *Sticky Top Navigation Bar* dengan `border-bottom: 1px solid rgba(255,255,255,0.10)`. |

### 2.2 Text & Typography Hierarchy
| Token Name | Hex / Value | Contrast Ratio | Usage |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#FFFFFF` / `#F4F4F6` | `19.4 : 1` (AAA) | Judul utama, angka metrik KPI, nilai nominal USDC, tombol utama. |
| `--text-secondary` | `#D4D4D8` (`zinc-300`) | `13.1 : 1` (AAA) | Sub-judul kartu, deskripsi teknis sirkuit. |
| `--text-muted` | `#A1A1AA` (`zinc-400`) | `7.8 : 1` (AAA) | Label parameter, *eyebrow metadata*, keterangan sekunder. |
| `--text-dim` | `#71717A` (`zinc-500`) | `4.6 : 1` (AA) | Teks *ciphertext* terenkripsi pada mode *Public Explorer View*. |

### 2.3 Semantic & Cryptographic Accents (10% Allocation)
| Token Name | Hex / Value | Cryptographic Meaning |
| :--- | :--- | :--- |
| `--accent-stark-white` | `#FFFFFF` | **Cross-Chain Withdrawal Intent** (`C_out_intent`), CTA Primer, *Active State*. |
| `--accent-asp-emerald` | `#10B981` (`emerald-400`) | **0xbow ASP (Proof of Association)** terverifikasi, `ZK-DVN Active`, status `Circuit Ready`. |
| `--accent-lzread-amber` | `#F59E0B` (`amber-300`) | **LayerZero V2 `lzRead`** *State Pull*, penghematan gas `-91%`, dan *Native ETH Gas Drop*. |
| `--accent-stealth-cyan` | `#38BDF8` (`sky-400`) | Indikator modul **Viewing Key (ZVK-256)** & *Selective Disclosure*. |
| `--accent-warning-red` | `#F87171` (`red-400`) | Peringatan korelasi nominal (jika *split* `100%`) atau jika `0xbow ASP` dinonaktifkan. |

### 2.4 Border & Texture Tokens
- **Hairline Structural Border**: `1px solid rgba(255, 255, 255, 0.10)`
- **Active Node / Inspector Border**: `1px solid rgba(255, 255, 255, 0.35)` hingga `#FFFFFF`
- **Dot-Matrix Technical Grid (`.bg-dot-matrix`)**:
  ```css
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 18px 18px;
  ```

---

## 3. Typography & Scannable Hierarchy

Sistem tipografi memadukan tiga keluarga huruf dari Google Fonts untuk membedakan antara narasi protokol, antarmuka fungsional, dan bukti kriptografi:

1. **Display / Headline (`--font-display`: `'Outfit'`, sans-serif)**
   - **Karakter**: Geometris, tajam, berwibawa untuk judul protokol Web3.
   - **Skala Ukuran**:
     - Hero Headline (`h1`): `clamp(1.875rem, 4vw, 3rem)` (`30px–48px`), `font-weight: 700`, `line-height: 1.08`, `letter-spacing: -0.02em`.
     - Section Header (`h2`): `1.5rem–1.875rem` (`24px–30px`), `font-weight: 600`.
     - Card Title (`h3`): `1.125rem–1.25rem` (`18px–20px`), `font-weight: 600`.

2. **UI & Body Copy (`--font-sans`: `'Plus Jakarta Sans'`, sans-serif)**
   - **Karakter**: Sangat mudah dibaca pada ukuran kecil (`12px–16px`) untuk penjelasan mekanisme *Join-Split* dan *Use Cases*.
   - **Lebar Baris Maksimum**: `65ch` pada paragraf penjelasan untuk mencegah kelelahan baca.

3. **Cryptographic Telemetry & Numeric Discipline (`--font-mono`: `'JetBrains Mono'`, monospace)**
   - **Aturan Wajib**: Semua angka nominal (`75,000 USDC`), persentase (`-91%`), Endpoint ID (`EID 30101`), *Merkle Root* (`0xf43ac1bc...`), *Nullifier Hash*, dan *ERC-5564 Stealth Address* (`st:eth:0x...`) menggunakan `.font-mono-num` dengan `font-variant-numeric: tabular-nums` agar tidak bergeser saat nilai berubah secara *real-time*.

---

## 4. 3D Visual Architecture (Three.js WebGL & Isometric CSS/SVG)

Project ini menggabungkan **dua lapisan visual 3D** yang saling terhubung secara reaktif terhadap state aplikasi (`ZoftCircuitConfig`):

### 4.1 Lapisan 1: 3D Noir ZK Join-Split Reactor (`ZoftReactorViewport.tsx`)
Dibangun menggunakan **Three.js (`WebGLRenderer`)** dengan `ACESFilmicToneMapping` dan terdiri dari **10 komponen geometri 3D modular**:

1. **U-Shaped Monolithic Basin (Hookr-Inspired Chamber)**:
   - Terdiri dari *Base Plate* (`BoxGeometry(4.4, 0.36, 2.7)`), *Left Pillar* (`BoxGeometry(0.68, 1.55, 2.7)`), *Right Pillar*, serta *Back & Front Lip Walls* menggunakan material `MeshStandardMaterial` berwarna **Dark Brushed Gunmetal (`#181920`, `metalness: 0.72`, `roughness: 0.28`)** yang dilapisi *wireframe edge cage* putih tipis (`LineSegments` + `EdgesGeometry`).
2. **Dynamic Split Liquidity Bars (Reaktif terhadap `withdrawalSplitPercent`)**:
   - **Cross-Chain Intent Bar (`intentBar`)**: Balok 3D putih bercahaya (`#F8FAFC`, `emissive: #FFFFFF`) di dalam cekungan U yang lebarnya membesar/mengecil secara *smooth-lerping* mengikuti persentase *Cross-Chain Intent* (misal `75%`).
   - **Shielded Change Bar (`changeBar`)**: Balok 3D perak-grafit (`#52525B`, `roughness: 0.22`) di sebelahnya yang merepresentasikan sisa *Shielded Change Note* (misal `25%`).
   - **Laser Divider Blade (`dividerBlade`)**: Bilah tipis bercahaya yang bergeser secara real-time di titik potong *Join-Split* (`splitX`).
3. **Central Floating Noir ZK Proof Crystal (`zkCrystal` + `zkCage`)**:
   - Geometri `OctahedronGeometry(0.46, 0)` dengan material kaca fisik (`MeshPhysicalMaterial`, `clearcoat: 1.0`, `emissive: #E4E4E7`) yang melayang dan berputar di atas celah *Join-Split*. Kecepatan rotasi meningkat mengikuti jumlah **Input UTXO Notes** yang dikonsolidasikan.
4. **LayerZero V2 `lzRead` Dual Orbital Gyroscope (`lzOuterRing` + `lzInnerRing`)**:
   - Dua cincin `TorusGeometry` konsentris yang mengorbit kristal ZK. Menyala terang (`opacity: 0.85`) saat fitur pull-based `lzRead` aktif, dan meredup jika pengguna beralih ke mode legacy push.
5. **0xbow ASP Compliance Base Halo (`aspHalo` + `pedestalMesh`)**:
   - Cincin heksagonal di dasar reaktor yang memancarkan pendaran **Emerald (`#10B981`)** saat *Proof of Association (PoA)* valid, atau berubah menjadi **Merah (`#EF4444`)** jika kepatuhan `0xbow ASP` dimatikan.
6. **Orbital UTXO Commitment Satellites (`particleGroup`)**:
   - 24 partikel `IcosahedronGeometry` mikro yang mengorbit reaktor dengan kecepatan yang dipengaruhi oleh ukuran **Solver Anonymity Batch (`solverBatchSize`)**.
7. **Interactive Proof Shockwave (`shockwaveRing`) & Camera Orbit**:
   - Mendukung *drag-to-orbit* $360^\circ$ melalui pointer mouse/touch, ditambah gelombang kejut (*shockwave*) dan lonjakan kecepatan rotasi saat tombol **"Play the Proof & Settlement"** ditekan.

### 4.2 Lapisan 2: Tactile 3D Isometric Bricks (`IsometricBrickStrip.tsx`)
Mengadaptasi kontrol parameter 3D dari **Hookr.fun**:
- Setiap strip terdiri dari **16 balok 3D isometrik (`SVG 3-Face Extruded Prism`)** yang masing-masing memiliki tiga bidang pencahayaan:
  - **Top Face** (paling terang: `#FFFFFF` untuk aktif, `#52525B` untuk *Shielded Change*, `#232631` untuk non-aktif).
  - **Left Face** (bayangan medium: `#D4D4D8` / `#3F3F46` / `#181A22`).
  - **Right Face** (bayangan dalam: `#A1A1AA` / `#27272A` / `#101217`).
- **Interaksi Real-Time**: Saat pengguna mengklik balok ke-$k$, nilai parameter (`withdrawalSplitPercent`, `solverBatchSize`, atau `nativeGasDropEth`) langsung diperbarui, balok mengalami *spring-lift* (`-translate-y-1`), dan ukuran balok likuiditas di dalam **3D Noir ZK Reactor** langsung bergeser seketika.

---

## 5. Multi-Route Layout & Spatial Architecture (`/` vs `/app`)

Aplikasi dibagi menjadi dua rute utama dengan fungsi yang tegas:

### 5.1 Route `/` — Multi-Section Web3 Protocol Landing Page (`ZoftOverviewSections.tsx`)
Dirancang sebagai halaman pengenalan protokol institusional & DeFi:
1. **3-Zone Sticky Header**: Wordmark `zOFT Protocol` di kiri, 4 navigasi sesi (`Architecture`, `Breakthroughs`, `Use Cases`, `Viewing Keys`) di tengah, dan CTA primer **`Launch dApp (/app)`** di kanan.
2. **Hero Section (12-Column Asymmetric Split + 4-Column KPI Strip)**:
   - **7 Kolom Kiri**: Tesis utama protokol, penjelasan masalah *bridge* transparan vs solusi *zOFT*, serta tombol **`Launch Circuit Builder dApp (/app)`** dan **`Simulate 3D Join-Split Proof`**.
   - **5 Kolom Kanan**: Showcase interaktif **3D Noir ZK Join-Split Reactor**.
   - **4-Column Quantitative Strip**: `-91% lzRead Gas`, `0.00% Cross-Chain Amount Correlation`, `ERC-5564 Stealth`, dan `0xbow ASP`.
3. **Section 01 — End-to-End Omnichain Join-Split Pipeline (`#architecture`)**: Diagram 3 tahap (*Source Vault* $\rightarrow$ *Omnigraph LayerZero V2 `lzRead`* $\rightarrow$ *Destination ERC-5564 Settlement*).
4. **Section 02 — 4 Core Cryptographic Breakthroughs (`#breakthroughs`)**: Grid $2 \times 2$ dengan kontrol *3D Isometric Bricks* langsung di dalam kartu.
5. **Section 03 — Operational Verticals / Use Cases (`#use-cases`)**: Tab interaktif 4 skenario (*Confidential Payroll*, *Whale Rebalancing*, *B2B Invoicing*, *OpSec Decoupling*) dengan tombol *deep-link* yang langsung memuat preset tersebut ke `/app`.
6. **Section 04 — Zcash-Style Viewing Key & 0xbow ASP Compliance Inspector (`#compliance-auditor`)**: Simulasi *toggle* antara tampilan auditor pajak (*Decrypted via Viewing Key*) dan tampilan *block explorer* publik (*Ciphertext Only*).

### 5.2 Route `/app` — Interactive 3D Circuit Builder dApp (`ZoftCircuitBuilder.tsx`)
Dirancang sebagai *workspace* dApp interaktif bergaya **Hookr.fun/builder**:
1. **Top Use-Case Template Selector**: 4 tombol skenario cepat (`75% Split`, `65% Split`, `85% Split`, `60% Split`) untuk memulai konfigurasi sirkuit.
2. **12-Column Spatial Circuit Board**:
   - **7 Kolom Kiri (`Your zOFT Circuit Board`)**: Kanvas dot-matrix berisi diagram aliran sirkuit:
     - *Top Node*: `Source Vault` + `0xbow ASP Proof of Association`.
     - *Middle Left Port*: `Input UTXO Notes` (klik untuk mengaktifkan/menonaktifkan konsolidasi multi-note).
     - *Center Chamber*: **3D Noir ZK Join-Split Reactor** + *Nullifier Hash*.
     - *Middle Right Port*: `LayerZero V2 lzRead` & `ZK-DVN State Pull`.
     - *Bottom Dual Outputs*: `Shielded Change Note` (tetap di rantai asal) & `ERC-5564 Stealth Output` (cair di rantai tujuan + *Native ETH Gas Drop*).
   - **5 Kolom Kanan (`Modular Accordion & 3D Brick Inspector`)**:
     - 5 blok sirkuit yang dapat dipilih (*In-Circuit Join-Split Ratio*, *Multi-Note UTXO Consolidation*, *LayerZero V2 `lzRead` & ZK-DVN*, *ERC-5564 Stealth & `lzCompose`*, *0xbow ASP & Zcash Viewing Keys*).
     - Panel inspektor bawah dengan **3D Isometric Bricks**, pemilih *Source/Destination Chain*, *Atomic `lzCompose` DeFi Route* (Direct, Aave V3, Uniswap v4, Pendle PT), penyalinan *Viewing Key*, dan tombol eksekusi **`Execute Join-Split Proof`**.
