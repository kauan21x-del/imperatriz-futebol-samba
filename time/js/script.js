// ==========================================
// 1. CONFIGURAÇÃO SUPABASE - IMPERATRIZ FUTEBOL E SAMBA
// ==========================================
const SUPABASE_URL = 'https://poyiirtpftembxljubsi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pxzp3LH7CPbjQJ7VZlphwQ_xsIuM_XP';
const BUCKET_NAME = 'imperatriz-fotos';
const CLUB_WHATSAPP = '5511970285292';
const MATCHDAY_ART_BG = './arte-dia-de-jogo.jpg';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. MENU MOBILE, PALETAS E CONTAGEM REGRESSIVA
// ==========================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });
}

const THEME_PALETTES = [
  { id: 'classic', label: '🎨 Paleta: Clássica' },
  { id: 'dark', label: '🌙 Paleta: Dark' },
  { id: 'samba', label: '✨ Paleta: Vinho & Ouro' }
];

let currentThemeIndex = 0;

function applyThemePalette(themeId) {
  const htmlEl = document.documentElement;
  const idx = THEME_PALETTES.findIndex(t => t.id === themeId);
  currentThemeIndex = idx >= 0 ? idx : 0;

  const chosen = THEME_PALETTES[currentThemeIndex];
  if (chosen.id === 'classic') {
    htmlEl.removeAttribute('data-theme');
  } else {
    htmlEl.setAttribute('data-theme', chosen.id);
  }

  const btn = document.getElementById('btn-toggle-theme');
  if (btn) btn.textContent = chosen.label;

  try {
    localStorage.setItem('imperatriz_theme', chosen.id);
  } catch (_) {}
}

function cycleThemePalette() {
  const nextIndex = (currentThemeIndex + 1) % THEME_PALETTES.length;
  applyThemePalette(THEME_PALETTES[nextIndex].id);
}

try {
  const savedTheme = localStorage.getItem('imperatriz_theme');
  applyThemePalette(savedTheme || 'classic');
} catch (_) {
  applyThemePalette('classic');
}

let targetDate = null;

// Função: updateCountdown() - Atualiza o relógio do próximo confronto no topo
function updateCountdown() {
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');

  if (!targetDate) {
    if (elDays) elDays.textContent = '00';
    if (elHours) elHours.textContent = '00';
    if (elMins) elMins.textContent = '00';
    if (elSecs) elSecs.textContent = '00';
    return;
  }

  const now = new Date().getTime();
  const diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (elDays) elDays.textContent = String(days).padStart(2, '0');
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMins) elMins.textContent = String(mins).padStart(2, '0');
  if (elSecs) elSecs.textContent = String(secs).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Função: switchMatchTab() - Alterna entre abas "Próximos Jogos" e "Últimos Resultados"
function switchMatchTab(tab) {
  const panelProximos = document.getElementById('panel-proximos');
  const panelResultados = document.getElementById('panel-resultados');
  const tabProximos = document.getElementById('tab-proximos');
  const tabResultados = document.getElementById('tab-resultados');

  if (tab === 'proximos') {
    panelProximos.classList.remove('hidden');
    panelResultados.classList.add('hidden');
    tabProximos.className = 'px-5 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider bg-imperatriz-red text-white transition';
    tabResultados.className = 'px-5 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-imperatriz-red transition';
  } else {
    panelProximos.classList.add('hidden');
    panelResultados.classList.remove('hidden');
    tabResultados.className = 'px-5 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider bg-imperatriz-red text-white transition';
    tabProximos.className = 'px-5 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider text-gray-600 hover:text-imperatriz-red transition';
  }
}

// ==========================================
// 3. UPLOAD DE IMAGENS NO SUPABASE STORAGE
// ==========================================
// Função: uploadImageToStorage() - Envia imagem para o bucket imperatriz-fotos
async function uploadImageToStorage(file, folder) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabaseClient.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// ==========================================
// 4. ESCUDO DO CLUBE (SUPABASE)
// ==========================================
const defaultShieldSVG = `
  <svg viewBox="0 0 120 140" class="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18 L60 6 L110 18 L110 72 C110 105 60 132 60 132 C60 132 10 105 10 72 Z" fill="#FFFFFF" stroke="#C8102E" stroke-width="6"/>
    <path d="M18 24 L60 14 L102 24 L102 70 C102 98 60 122 60 122 C60 122 18 98 18 70 Z" fill="#C8102E"/>
    <path d="M40 24 L52 24 L52 117 C47 113 43 109 40 105 Z" fill="#FFFFFF"/>
    <path d="M68 24 L80 24 L80 105 C77 109 73 113 68 117 Z" fill="#FFFFFF"/>
    <path d="M42 46 L48 34 L60 43 L72 34 L78 46 Z" fill="#FFFFFF" stroke="#8E0B20" stroke-width="2"/>
    <circle cx="60" cy="76" r="21" fill="#8E0B20" stroke="#FFFFFF" stroke-width="3"/>
    <text x="60" y="83" text-anchor="middle" fill="#FFFFFF" font-family="Oswald, sans-serif" font-weight="700" font-size="21" letter-spacing="1">IFC</text>
  </svg>
`;

let currentClubLogoUrl = '';
let artSelectedOpponentLogo = '';

// Função: renderClubLogo() - Atualiza o escudo no header e no cartão do próximo jogo
function renderClubLogo(logoUrl) {
  const headerContainer = document.getElementById('header-logo-container');
  const matchContainer = document.getElementById('match-logo-container');

  if (logoUrl) {
    if (headerContainer) {
      headerContainer.innerHTML = `<img src="${logoUrl}" alt="Escudo Imperatriz" class="w-12 h-12 object-contain drop-shadow-md rounded-md">`;
    }
    if (matchContainer) {
      matchContainer.innerHTML = `<img src="${logoUrl}" alt="Escudo Imperatriz" class="w-14 h-14 object-contain">`;
    }
  } else {
    if (headerContainer) headerContainer.innerHTML = defaultShieldSVG;
    if (matchContainer) matchContainer.innerHTML = `<div class="w-14 h-14">${defaultShieldSVG}</div>`;
  }
}

// Função: fetchClubLogoFromDB() - Carrega o escudo salvo na tabela club_settings
async function fetchClubLogoFromDB() {
  const { data, error } = await supabaseClient
    .from('club_settings')
    .select('logo_url')
    .eq('id', 1)
    .single();

  if (!error && data && data.logo_url) {
    currentClubLogoUrl = data.logo_url;
    renderClubLogo(data.logo_url);
  }
}

// Função: triggerLogoUpload() - Abre seletor de arquivo para trocar o escudo
function triggerLogoUpload() {
  const input = document.getElementById('club-logo-input');
  if (!input) return;
  input.value = '';
  input.click();
}

const clubLogoInput = document.getElementById('club-logo-input');
if (clubLogoInput) {
  clubLogoInput.addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const btn = document.getElementById('btn-change-logo');
    if (btn) {
      btn.textContent = '⏳ Salvando...';
      btn.disabled = true;
    }

    try {
      const publicUrl = await uploadImageToStorage(file, 'escudo');

      const { error } = await supabaseClient
        .from('club_settings')
        .upsert({ id: 1, logo_url: publicUrl });

      if (error) throw error;

      currentClubLogoUrl = publicUrl;
      renderClubLogo(publicUrl);
    } catch (err) {
      console.error('Erro ao salvar escudo:', err);
      alert('Não foi possível salvar o novo escudo. Verifique se a tabela club_settings e as permissões existem no Supabase.');
    } finally {
      if (btn) {
        btn.textContent = '🛡️ Trocar Escudo';
        btn.disabled = false;
      }
    }
  });
}

// ==========================================
// 5. ELENCO E COMISSÃO TÉCNICA (SUPABASE)
// ==========================================
const positionOrder = {
  'Goleiro': 1,
  'Defensor': 2,
  'Meio-Campo': 3,
  'Atacante': 4,
  'Comissão Tecnica': 5,
  'Comissão Técnica': 5
};

let players = [];
let currentPlayerFilter = 'todos';
let quickUploadTargetId = null;

// Função: fetchPlayersFromDB() - Busca todos os integrantes na tabela players
async function fetchPlayersFromDB() {
  const { data, error } = await supabaseClient
    .from('players')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar jogadores/comissão:', error);
    return;
  }

  players = (data || []).map(row => ({
    id: row.id,
    number: row.number,
    name: row.name,
    position: row.position,
    role: row.role,
    games: row.games,
    goals: row.goals,
    photoUrl: row.photo_url || ''
  }));

  renderPlayers();
}

// Função: renderPlayers() - Renderiza os cards de jogadores e comissão técnica na tela
function renderPlayers(filter = currentPlayerFilter) {
  currentPlayerFilter = filter;
  const grid = document.getElementById('players-grid');
  if (!grid) return;

  const sorted = [...players].sort((a, b) => {
    const orderA = positionOrder[a.position] ?? 99;
    const orderB = positionOrder[b.position] ?? 99;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.number - b.number;
  });

  const filtered = filter === 'todos' ? sorted : sorted.filter(p => p.position === filter);

  const allBtn = document.querySelector('.filter-btn[data-filter="todos"]');
  if (allBtn) allBtn.textContent = `Todos (${players.length})`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
        <p class="font-display text-xl font-bold uppercase text-gray-500">Nenhum integrante encontrado neste filtro</p>
        <p class="text-xs text-gray-400 mt-1">Clique em "+ Adicionar Jogador e Foto" para cadastrar.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(player => {
    const isStaff = player.position === 'Comissão Tecnica' || player.position === 'Comissão Técnica';
    const badgeText = isStaff ? 'STAFF' : `#${player.number}`;
    const statRightLabel = player.position === 'Goleiro'
      ? 'Defesas Difíceis: '
      : isStaff
        ? 'Participações: '
        : 'Gols: ';

    return `
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm card-hover group flex flex-col">
        <div class="relative h-64 player-photo-frame border-b-4 border-imperatriz-red overflow-hidden flex items-center justify-center">
          <span class="absolute top-3 left-3 z-10 bg-imperatriz-red text-white font-display ${isStaff ? 'text-xs px-2.5 h-9' : 'text-2xl w-11 h-11'} font-bold rounded-lg flex items-center justify-center shadow-md border border-white/30">
            ${badgeText}
          </span>

          <span class="absolute top-3 right-3 z-10 bg-white/95 text-imperatriz-darkRed text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm border border-red-100">
            ${player.position}
          </span>

          ${player.photoUrl ? `
            <img src="${player.photoUrl}" alt="${player.name}" class="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105">
          ` : `
            <div class="flex flex-col items-center justify-center text-center px-4">
              <div class="w-24 h-24 rounded-full bg-white border-2 border-dashed border-red-300 flex items-center justify-center text-imperatriz-red mb-2 shadow-inner">
                <svg class="w-12 h-12 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
                </svg>
              </div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sem foto cadastrada</span>
            </div>
          `}

          <button id="btn-photo-${player.id}" onclick="triggerQuickPlayerPhoto(${player.id})" class="absolute bottom-3 right-3 z-10 bg-gray-900/90 hover:bg-imperatriz-red text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 transition">
            <span>📷 ${player.photoUrl ? 'Trocar Foto' : 'Adicionar Foto'}</span>
          </button>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-display text-xl font-bold uppercase text-gray-900 group-hover:text-imperatriz-red transition">${player.name}</h3>
              <p class="text-xs font-semibold text-gray-500 mt-0.5">${player.role}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button type="button" onclick="openEditPlayerModal(${player.id})" class="p-1.5 rounded-md text-gray-500 hover:text-imperatriz-red hover:bg-red-50 transition" title="Editar informações">
                ✏️
              </button>
              <button type="button" onclick="deletePlayerById(${player.id})" class="p-1.5 rounded-md text-gray-500 hover:text-red-700 hover:bg-red-50 transition" title="Excluir">
                🗑️
              </button>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs font-bold text-gray-600">
            <span>Jogos: <strong class="text-gray-900">${player.games}</strong></span>
            <span>${statRightLabel}<strong class="text-imperatriz-red">${player.goals}</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Função: filterPlayers() - Filtra os integrantes por setor/posição
function filterPlayers(position) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.filter === position) {
      btn.className = 'filter-btn active px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider bg-imperatriz-red text-white transition';
    } else {
      btn.className = 'filter-btn px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-imperatriz-red transition';
    }
  });
  renderPlayers(position);
}

// Função: triggerQuickPlayerPhoto() - Troca rápida de foto no card
const quickPlayerInput = document.getElementById('quick-player-photo-input');

function triggerQuickPlayerPhoto(playerId) {
  quickUploadTargetId = playerId;
  quickPlayerInput.value = '';
  quickPlayerInput.click();
}

if (quickPlayerInput) {
  quickPlayerInput.addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file || !quickUploadTargetId) return;

    const btn = document.getElementById(`btn-photo-${quickUploadTargetId}`);
    if (btn) btn.innerHTML = '<span>⏳ Salvando...</span>';

    try {
      const publicUrl = await uploadImageToStorage(file, 'jogadores');

      const { error } = await supabaseClient
        .from('players')
        .update({ photo_url: publicUrl })
        .eq('id', quickUploadTargetId);

      if (error) throw error;

      const player = players.find(p => p.id === quickUploadTargetId);
      if (player) player.photoUrl = publicUrl;
      renderPlayers();
    } catch (err) {
      console.error('Erro ao salvar foto:', err);
      alert(`Não foi possível salvar a foto: ${err.message || 'verifique as permissões do bucket "imperatriz-fotos".'}`);
      renderPlayers();
    }
  });
}

// ==========================================
// 6. MODAL ADICIONAR / ATUALIZAR FOTO
// ==========================================
let modalMode = 'add';

// Função: syncModalNumberField() - Ajusta o campo de camisa quando escolhe Comissão Tecnica
function syncModalNumberField() {
  const positionSelect = document.getElementById('modal-player-position');
  const numberInput = document.getElementById('modal-player-number');
  if (!positionSelect || !numberInput) return;

  const isStaff = positionSelect.value === 'Comissão Tecnica' || positionSelect.value === 'Comissão Técnica';
  numberInput.placeholder = isStaff ? '0' : '14';
  if (isStaff && !numberInput.value) {
    numberInput.value = '0';
  } else if (!isStaff && numberInput.value === '0') {
    numberInput.value = '';
  }
}

const modalPositionSelect = document.getElementById('modal-player-position');
if (modalPositionSelect) {
  modalPositionSelect.addEventListener('change', syncModalNumberField);
}

// Função: openPlayerModal() - Abre modal de cadastro ou troca de foto
function openPlayerModal(mode = 'add') {
  modalMode = mode;
  const modal = document.getElementById('player-modal');
  const title = document.getElementById('player-modal-title');
  const newFields = document.getElementById('new-player-fields');
  const selectWrap = document.getElementById('existing-player-select-wrap');
  const preview = document.getElementById('modal-photo-preview');
  const placeholder = document.getElementById('modal-photo-placeholder');

  document.getElementById('player-photo-form').reset();
  preview.classList.add('hidden');
  placeholder.textContent = '📷 Clique para escolher a foto do celular ou PC';

  if (mode === 'update') {
    title.textContent = 'Atualizar Foto';
    newFields.classList.add('hidden');
    selectWrap.classList.remove('hidden');

    const select = document.getElementById('existing-player-select');
    const sorted = [...players].sort((a, b) => (positionOrder[a.position] ?? 99) - (positionOrder[b.position] ?? 99) || a.number - b.number);
    select.innerHTML = sorted.map(p => {
      const labelNum = (p.position === 'Comissão Tecnica' || p.position === 'Comissão Técnica') ? 'STAFF' : `#${p.number}`;
      return `<option value="${p.id}">${labelNum} - ${p.name} (${p.position})</option>`;
    }).join('');
  } else {
    title.textContent = 'Adicionar Jogador / Comissão e Foto';
    newFields.classList.remove('hidden');
    selectWrap.classList.add('hidden');
    syncModalNumberField();
  }

  modal.classList.remove('hidden');
}

// Função: closePlayerModal() - Fecha o modal de cadastro
function closePlayerModal() {
  document.getElementById('player-modal').classList.add('hidden');
}

const modalPhotoFile = document.getElementById('modal-player-photo-file');
if (modalPhotoFile) {
  modalPhotoFile.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const preview = document.getElementById('modal-photo-preview');
      preview.src = event.target.result;
      preview.classList.remove('hidden');
      document.getElementById('modal-photo-placeholder').textContent = '✅ Foto selecionada (clique para trocar)';
    };
    reader.readAsDataURL(file);
  });
}

const playerPhotoForm = document.getElementById('player-photo-form');
if (playerPhotoForm) {
  playerPhotoForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('modal-submit-btn');
    const file = document.getElementById('modal-player-photo-file').files[0];

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      if (modalMode === 'update') {
        const selectedId = Number(document.getElementById('existing-player-select').value);
        if (!file) {
          alert('Selecione uma foto antes de salvar.');
          return;
        }

        const publicUrl = await uploadImageToStorage(file, 'jogadores');
        const { error } = await supabaseClient
          .from('players')
          .update({ photo_url: publicUrl })
          .eq('id', selectedId);

        if (error) throw error;

        const player = players.find(p => p.id === selectedId);
        if (player) player.photoUrl = publicUrl;
      } else {
        const name = document.getElementById('modal-player-name').value.trim();
        const position = document.getElementById('modal-player-position').value;
        const isStaff = position === 'Comissão Tecnica' || position === 'Comissão Técnica';
        const rawNumberStr = document.getElementById('modal-player-number').value.trim();
        const parsedNumber = rawNumberStr === '' ? null : Number(rawNumberStr);
        const number = isStaff ? (parsedNumber ?? 0) : parsedNumber;
        const role = document.getElementById('modal-player-role').value.trim() || (isStaff ? 'Técnico / Auxiliar' : position);

        if (!name) {
          alert('Preencha o nome.');
          return;
        }

        if (!isStaff && (!number || number < 1)) {
          alert('Preencha o número da camisa do jogador.');
          return;
        }

        let photoUrl = '';
        if (file) {
          photoUrl = await uploadImageToStorage(file, 'jogadores');
        }

        const { data, error } = await supabaseClient
          .from('players')
          .insert([{ number, name, position, role, games: 0, goals: 0, photo_url: photoUrl }])
          .select()
          .single();

        if (error) throw error;

        players.push({
          id: data.id,
          number: data.number,
          name: data.name,
          position: data.position,
          role: data.role,
          games: data.games,
          goals: data.goals,
          photoUrl: data.photo_url || ''
        });
      }

      renderPlayers();
      closePlayerModal();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert(`Erro ao salvar no banco: ${err.message || 'verifique a tabela players e as políticas RLS no Supabase.'}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar no Banco';
    }
  });
}

// ==========================================
// 7. EDITAR E EXCLUIR ATLETAS / COMISSÃO (SUPABASE)
// ==========================================
function openEditPlayerModal(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  document.getElementById('edit-player-form').reset();
  document.getElementById('edit-player-id').value = player.id;
  document.getElementById('edit-player-name').value = player.name;
  document.getElementById('edit-player-number').value = player.number ?? 0;

  const posSelect = document.getElementById('edit-player-position');
  if (posSelect && !Array.from(posSelect.options).some(opt => opt.value === player.position)) {
    const extraOpt = document.createElement('option');
    extraOpt.value = player.position;
    extraOpt.textContent = player.position;
    posSelect.appendChild(extraOpt);
  }
  posSelect.value = player.position;

  document.getElementById('edit-player-role').value = player.role;
  document.getElementById('edit-player-games').value = player.games;
  document.getElementById('edit-player-goals').value = player.goals;
  document.getElementById('edit-player-goals-label').textContent =
    player.position === 'Goleiro'
      ? 'Defesas Difíceis'
      : (player.position === 'Comissão Tecnica' || player.position === 'Comissão Técnica')
        ? 'Participações'
        : 'Gols';

  document.getElementById('edit-player-modal').classList.remove('hidden');
}

function closeEditPlayerModal() {
  document.getElementById('edit-player-modal').classList.add('hidden');
}

const editPlayerForm = document.getElementById('edit-player-form');
if (editPlayerForm) {
  editPlayerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const playerId = Number(document.getElementById('edit-player-id').value);
    const currentPlayer = players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    const submitBtn = document.getElementById('edit-player-submit-btn');
    const file = document.getElementById('edit-player-photo-file').files[0];

    const updatedFields = {
      name: document.getElementById('edit-player-name').value.trim(),
      number: Number(document.getElementById('edit-player-number').value) || 0,
      position: document.getElementById('edit-player-position').value,
      role: document.getElementById('edit-player-role').value.trim() || document.getElementById('edit-player-position').value,
      games: Number(document.getElementById('edit-player-games').value) || 0,
      goals: Number(document.getElementById('edit-player-goals').value) || 0,
      photo_url: currentPlayer.photoUrl || ''
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      if (file) {
        updatedFields.photo_url = await uploadImageToStorage(file, 'jogadores');
      }

      const { error } = await supabaseClient
        .from('players')
        .update(updatedFields)
        .eq('id', playerId);

      if (error) throw error;

      Object.assign(currentPlayer, {
        name: updatedFields.name,
        number: updatedFields.number,
        position: updatedFields.position,
        role: updatedFields.role,
        games: updatedFields.games,
        goals: updatedFields.goals,
        photoUrl: updatedFields.photo_url
      });

      renderPlayers();
      closeEditPlayerModal();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      alert(`Não foi possível salvar as alterações: ${err.message || 'tente novamente.'}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar Alterações';
    }
  });
}

async function deletePlayerById(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  const confirmed = confirm(`Tem certeza que deseja excluir "${player.name}"?`);
  if (!confirmed) return;

  try {
    const { error } = await supabaseClient
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;

    players = players.filter(p => p.id !== playerId);
    renderPlayers();
    closeEditPlayerModal();
  } catch (err) {
    console.error('Erro ao excluir:', err);
    alert(`Não foi possível excluir: ${err.message || 'verifique a política de DELETE no Supabase.'}`);
  }
}

async function deletePlayerFromDB() {
  const playerId = Number(document.getElementById('edit-player-id').value);
  if (playerId) {
    await deletePlayerById(playerId);
  }
}

// ==========================================
// 8. JOGOS, RESULTADOS, ESTATÍSTICAS E PRÓXIMO CONFRONTO (SUPABASE)
// ==========================================
let matches = [];

function formatDateBR(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${d} ${months[Number(m) - 1] || m}`;
}

async function fetchMatchesFromDB() {
  const { data, error } = await supabaseClient
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar jogos:', error);
    return;
  }

  matches = data || [];
  renderMatches();
  updateSeasonStats();
  updateHeroNextMatch();
}

function updateSeasonStats() {
  const finished = matches.filter(m => m.status === 'resultados');
  const totalGames = finished.length;
  const wins = finished.filter(m => m.goals_for > m.goals_against).length;
  const draws = finished.filter(m => m.goals_for === m.goals_against).length;
  const goalsFor = finished.reduce((sum, m) => sum + (Number(m.goals_for) || 0), 0);
  const points = wins * 3 + draws;
  const rate = totalGames > 0 ? Math.round((points / (totalGames * 3)) * 100) : 0;

  const elGames = document.getElementById('stat-games');
  const elWins = document.getElementById('stat-wins');
  const elGoals = document.getElementById('stat-goals');
  const elRate = document.getElementById('stat-rate');

  if (elGames) elGames.textContent = totalGames;
  if (elWins) elWins.textContent = wins;
  if (elGoals) elGoals.textContent = goalsFor;
  if (elRate) elRate.textContent = `${rate}%`;
}

function updateHeroNextMatch() {
  const upcoming = matches
    .filter(m => m.status === 'proximos')
    .sort((a, b) => a.match_date.localeCompare(b.match_date));

  const nextMatch = upcoming[0];

  const elComp = document.getElementById('hero-match-competition');
  const elImpRole = document.getElementById('hero-imperatriz-role');
  const elWeekday = document.getElementById('hero-match-weekday');
  const elOppLogoWrap = document.getElementById('hero-opponent-logo-container');
  const elOppName = document.getElementById('hero-opponent-name');
  const elOppRole = document.getElementById('hero-opponent-role');
  const elVenue = document.getElementById('hero-match-venue');

  if (!nextMatch) {
    if (elComp) elComp.textContent = 'Temporada 2026';
    if (elImpRole) elImpRole.textContent = 'Mandante';
    if (elOppName) elOppName.textContent = 'A Definir';
    if (elOppLogoWrap) {
      elOppLogoWrap.innerHTML = `<div id="hero-opponent-initials" class="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center font-display font-bold text-lg">ADV</div>`;
    }
    if (elOppRole) elOppRole.textContent = 'Visitante';
    if (elWeekday) elWeekday.textContent = 'Em Breve';
    if (elVenue) elVenue.textContent = '📍 Cadastre o próximo jogo na tabela abaixo';
    targetDate = null;
    updateCountdown();
    return;
  }

  const [year, month, day] = nextMatch.match_date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const weekdayName = weekdays[dateObj.getDay()] || 'Jogo';

  const initials = nextMatch.opponent
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('') || 'ADV';

  if (elComp) elComp.textContent = nextMatch.competition || 'Amistoso';
  if (elImpRole) elImpRole.textContent = nextMatch.is_home ? 'Mandante' : 'Visitante';
  if (elWeekday) elWeekday.textContent = `${weekdayName} • ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;

  if (elOppLogoWrap) {
    if (nextMatch.opponent_logo) {
      elOppLogoWrap.innerHTML = `<img src="${nextMatch.opponent_logo}" alt="Escudo ${nextMatch.opponent}" class="w-14 h-14 object-contain">`;
    } else {
      elOppLogoWrap.innerHTML = `<div id="hero-opponent-initials" class="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center font-display font-bold text-lg">${initials}</div>`;
    }
  }

  if (elOppName) elOppName.textContent = nextMatch.opponent;
  if (elOppRole) elOppRole.textContent = nextMatch.is_home ? 'Visitante' : 'Mandante';
  if (elVenue) elVenue.textContent = `📍 ${nextMatch.location || 'Complexo Esportivo Vila Crett'} • ${nextMatch.match_time || '10:00'}`;

  const timeMatch = (nextMatch.match_time || '10:00').match(/(\d{1,2})[:h](\d{2})?/);
  const hour = timeMatch ? Number(timeMatch[1]) : 10;
  const minute = timeMatch && timeMatch[2] ? Number(timeMatch[2]) : 0;

  targetDate = new Date(year, month - 1, day, hour, minute, 0).getTime();
  updateCountdown();
}

function renderOpponentBadge(match) {
  const initials = match.opponent
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('') || 'ADV';

  if (match.opponent_logo) {
    return `<img src="${match.opponent_logo}" alt="${match.opponent}" class="w-5 h-5 object-contain rounded-sm shrink-0">`;
  }
  return `<span class="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[9px] font-extrabold flex items-center justify-center shrink-0">${initials}</span>`;
}

function renderMatches() {
  const panelProximos = document.getElementById('panel-proximos');
  const panelResultados = document.getElementById('panel-resultados');
  if (!panelProximos || !panelResultados) return;

  const upcoming = matches.filter(m => m.status === 'proximos');
  const finished = [...matches.filter(m => m.status === 'resultados')].reverse();

  panelProximos.innerHTML = upcoming.length === 0
    ? `<div class="col-span-full bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-gray-200">Nenhum próximo jogo agendado. Clique em <strong>"+ Novo Jogo / Placar"</strong> para cadastrar.</div>`
    : upcoming.map(m => `
      <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 ${m.is_home ? 'border-imperatriz-red' : 'border-gray-300'} card-hover">
        <div class="flex justify-between items-center text-xs font-bold text-gray-400 uppercase mb-4">
          <span>${m.competition || 'Amistoso'}</span>
          <div class="flex items-center gap-1.5">
            <span class="${m.is_home ? 'bg-red-50 text-imperatriz-red' : 'bg-gray-100 text-gray-600'} px-2.5 py-1 rounded">${m.is_home ? 'Em Casa' : 'Fora'}</span>
            <button onclick="openMatchModal(${m.id})" class="p-1 hover:text-imperatriz-red" title="Editar">✏️</button>
            <button onclick="deleteMatch(${m.id})" class="p-1 hover:text-red-700" title="Excluir">🗑️</button>
          </div>
        </div>
        <div class="space-y-3 my-4">
          <div class="flex items-center justify-between font-bold text-gray-900">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-imperatriz-red"></span>
              <span>Imperatriz Futebol e Samba</span>
            </div>
            <span class="text-xs font-extrabold text-imperatriz-red">${m.is_home ? 'MANDANTE' : 'VISITANTE'}</span>
          </div>
          <div class="flex items-center justify-between font-semibold text-gray-600">
            <div class="flex items-center gap-2.5">
              ${renderOpponentBadge(m)}
              <span>${m.opponent}</span>
            </div>
            <span class="text-xs">${m.is_home ? 'VISITANTE' : 'MANDANTE'}</span>
          </div>
        </div>
        <div class="pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500 flex justify-between">
          <span>📅 ${formatDateBR(m.match_date)} • ${m.match_time}</span>
          <span>📍 ${m.location}</span>
        </div>
      </div>
    `).join('');

  panelResultados.innerHTML = finished.length === 0
    ? `<div class="col-span-full bg-white rounded-xl p-8 text-center text-sm text-gray-500 border border-gray-200">Nenhum resultado registrado ainda.</div>`
    : finished.map(m => {
      const won = m.goals_for > m.goals_against;
      const draw = m.goals_for === m.goals_against;
      const badgeClass = won ? 'bg-emerald-50 text-emerald-700' : draw ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
      const borderClass = won ? 'border-emerald-500' : draw ? 'border-amber-400' : 'border-red-500';
      const label = won ? 'Vitória' : draw ? 'Empate' : 'Derrota';

      return `
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 ${borderClass} card-hover">
          <div class="flex justify-between items-center text-xs font-bold text-gray-400 uppercase mb-4">
            <span>${m.competition || 'Amistoso'}</span>
            <div class="flex items-center gap-1.5">
              <span class="${badgeClass} px-2.5 py-1 rounded">${label}</span>
              <button onclick="openMatchModal(${m.id})" class="p-1 hover:text-imperatriz-red" title="Editar">✏️</button>
              <button onclick="deleteMatch(${m.id})" class="p-1 hover:text-red-700" title="Excluir">🗑️</button>
            </div>
          </div>
          <div class="space-y-3 my-4">
            <div class="flex items-center justify-between font-extrabold text-gray-900 text-lg">
              <span>Imperatriz Futebol e Samba</span>
              <span class="bg-imperatriz-red text-white px-3 py-0.5 rounded font-display">${m.goals_for}</span>
            </div>
            <div class="flex items-center justify-between font-semibold text-gray-500 text-lg">
              <div class="flex items-center gap-2">
                ${renderOpponentBadge(m)}
                <span>${m.opponent}</span>
              </div>
              <span class="bg-gray-100 text-gray-700 px-3 py-0.5 rounded font-display">${m.goals_against}</span>
            </div>
          </div>
          <p class="pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">⚽ ${m.scorers ? 'Gols: ' + m.scorers : 'Sem gols registrados'}</p>
        </div>
      `;
    }).join('');
}

function toggleScoreFields() {
  const status = document.getElementById('match-status').value;
  const scoreFields = document.getElementById('match-score-fields');
  if (status === 'resultados') {
    scoreFields.classList.remove('hidden');
  } else {
    scoreFields.classList.add('hidden');
  }
}

function openMatchModal(matchId = null) {
  const form = document.getElementById('match-form');
  form.reset();
  document.getElementById('match-id').value = '';
  document.getElementById('match-modal-title').textContent = 'Cadastrar Jogo';

  if (matchId) {
    const m = matches.find(item => item.id === matchId);
    if (m) {
      document.getElementById('match-modal-title').textContent = 'Editar Jogo';
      document.getElementById('match-id').value = m.id;
      document.getElementById('match-opponent').value = m.opponent;
      document.getElementById('match-competition').value = m.competition || '';
      document.getElementById('match-form-date').value = m.match_date;
      document.getElementById('match-form-time').value = m.match_time || '10:00';
      document.getElementById('match-is-home').value = String(m.is_home);
      document.getElementById('match-form-location').value = m.location || 'Complexo Esportivo Vila Crett';
      document.getElementById('match-status').value = m.status;
      document.getElementById('match-goals-for').value = m.goals_for || 0;
      document.getElementById('match-goals-against').value = m.goals_against || 0;
      document.getElementById('match-scorers').value = m.scorers || '';
    }
  }

  toggleScoreFields();
  document.getElementById('match-modal').classList.remove('hidden');
}

function closeMatchModal() {
  document.getElementById('match-modal').classList.add('hidden');
}

const matchForm = document.getElementById('match-form');
if (matchForm) {
  matchForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('match-id').value;
    const submitBtn = document.getElementById('match-submit-btn');
    const logoFile = document.getElementById('match-opponent-logo-file')?.files[0];
    const existingMatch = id ? matches.find(item => item.id === Number(id)) : null;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      let opponentLogoUrl = existingMatch?.opponent_logo || '';
      if (logoFile) {
        opponentLogoUrl = await uploadImageToStorage(logoFile, 'adversarios');
      }

      const payload = {
        opponent: document.getElementById('match-opponent').value.trim(),
        competition: document.getElementById('match-competition').value.trim() || 'Amistoso',
        match_date: document.getElementById('match-form-date').value,
        match_time: document.getElementById('match-form-time').value.trim() || '10:00',
        is_home: document.getElementById('match-is-home').value === 'true',
        location: document.getElementById('match-form-location').value.trim() || 'Complexo Esportivo Vila Crett',
        status: document.getElementById('match-status').value,
        goals_for: Number(document.getElementById('match-goals-for').value) || 0,
        goals_against: Number(document.getElementById('match-goals-against').value) || 0,
        scorers: document.getElementById('match-scorers').value.trim(),
        opponent_logo: opponentLogoUrl
      };

      if (id) {
        const { error } = await supabaseClient.from('matches').update(payload).eq('id', Number(id));
        if (error) throw error;
      } else {
        const { error } = await supabaseClient.from('matches').insert([payload]);
        if (error) throw error;
      }

      await fetchMatchesFromDB();
      switchMatchTab(payload.status);
      closeMatchModal();
    } catch (err) {
      console.error('Erro ao salvar jogo:', err);
      alert(`Não foi possível salvar o jogo: ${err.message || 'verifique a tabela matches no Supabase.'}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar Jogo';
    }
  });
}

async function deleteMatch(matchId) {
  if (!confirm('Deseja excluir este jogo do calendário?')) return;

  try {
    const { error } = await supabaseClient.from('matches').delete().eq('id', matchId);
    if (error) throw error;

    matches = matches.filter(m => m.id !== matchId);
    renderMatches();
    updateSeasonStats();
    updateHeroNextMatch();
  } catch (err) {
    console.error('Erro ao excluir jogo:', err);
    alert(`Não foi possível excluir o jogo: ${err.message || 'tente novamente.'}`);
  }
}

// ==========================================
// 8B. CRIADOR DE ARTE PARA OS JOGOS (CANVAS)
// ==========================================
function loadImageSafe(url) {
  return new Promise(resolve => {
    if (!url) return resolve(null);
    const img = new Image();
    if (/^https?:\/\//i.test(url)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawShieldCircle(ctx, cx, cy, radius, img, fallbackText, borderColor, bgColor) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
    ctx.clip();

    const size = (radius - 8) * 1.75;
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 38px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackText, cx, cy + 2);
  }
  ctx.restore();
}

function openMatchArtModal() {
  const select = document.getElementById('art-match-select');
  if (select) {
    if (matches.length > 0) {
      select.innerHTML = matches.map(m => {
        const tag = m.status === 'resultados' ? 'Resultado' : 'Próximo';
        return `<option value="${m.id}">[${tag}] Imperatriz vs ${m.opponent} (${formatDateBR(m.match_date)})</option>`;
      }).join('');
      select.value = String(matches[0].id);
      loadSelectedMatchIntoArt();
    } else {
      select.innerHTML = `<option value="">Jogo Manual</option>`;
      document.getElementById('art-mode').value = 'proximo';
      document.getElementById('art-opponent').value = 'Adversário';
      document.getElementById('art-competition').value = 'Temporada 2026';
      document.getElementById('art-datetime').value = 'Em Breve • 10:00';
      document.getElementById('art-location').value = 'Complexo Esportivo Vila Crett';
      artSelectedOpponentLogo = '';
      renderMatchArtCanvas();
    }
  }

  document.getElementById('match-art-modal').classList.remove('hidden');
}

function closeMatchArtModal() {
  document.getElementById('match-art-modal').classList.add('hidden');
}

function loadSelectedMatchIntoArt() {
  const select = document.getElementById('art-match-select');
  const matchId = Number(select?.value);
  const m = matches.find(item => item.id === matchId);
  if (!m) return;

  const isResult = m.status === 'resultados';
  document.getElementById('art-mode').value = isResult ? 'resultado' : 'proximo';
  document.getElementById('art-opponent').value = m.opponent || 'Adversário';
  document.getElementById('art-competition').value = m.competition || 'Amistoso';
  document.getElementById('art-datetime').value = `${formatDateBR(m.match_date)}${m.match_time ? ' • ' + m.match_time : ''}`;
  document.getElementById('art-location').value = m.location || 'Complexo Esportivo Vila Crett';
  document.getElementById('art-goals-for').value = m.goals_for ?? 0;
  document.getElementById('art-goals-against').value = m.goals_against ?? 0;

  const scorersInput = document.getElementById('art-scorers');
  if (scorersInput) scorersInput.value = m.scorers || '';

  artSelectedOpponentLogo = m.opponent_logo || '';
  renderMatchArtCanvas();
}

async function renderMatchArtCanvas() {
  const canvas = document.getElementById('match-art-canvas');
  if (!canvas) return;

  const mode = document.getElementById('art-mode')?.value || 'proximo';
  const format = document.getElementById('art-format')?.value || 'square';
  const opponent = (document.getElementById('art-opponent')?.value || 'Adversário').trim();
  const competition = (document.getElementById('art-competition')?.value || 'Temporada 2026').trim().toUpperCase();
  const datetime = (document.getElementById('art-datetime')?.value || '').trim();
  const location = (document.getElementById('art-location')?.value || 'Complexo Esportivo Vila Crett').trim();
  const goalsFor = document.getElementById('art-goals-for')?.value ?? 0;
  const goalsAgainst = document.getElementById('art-goals-against')?.value ?? 0;
  const scorers = (document.getElementById('art-scorers')?.value || '').trim();

  const scoreBox = document.getElementById('art-score-box');
  if (scoreBox) {
    if (mode === 'resultado') scoreBox.classList.remove('hidden');
    else scoreBox.classList.add('hidden');
  }

  const width = 1080;
  const height = format === 'story' ? 1350 : 1080;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // 1. Fundo com a arte oficial do clube ou fallback caso o ficheiro não exista
  const [bgImg, clubImg, oppImg] = await Promise.all([
    loadImageSafe(MATCHDAY_ART_BG),
    loadImageSafe(currentClubLogoUrl),
    loadImageSafe(artSelectedOpponentLogo)
  ]);

  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, width, height);
  } else {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#8E0B20');
    grad.addColorStop(0.5, '#C8102E');
    grad.addColorStop(1, '#141416');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 64px Oswald, sans-serif';
    ctx.fillText(mode === 'resultado' ? 'RESULTADO FINAL' : 'DIA DE JOGO', width / 2, height * 0.24);
  }

  // Faixa superior com a competição
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(20, 20, 22, 0.85)';
  ctx.fillRect(140, 28, width - 280, 44);
  ctx.fillStyle = '#FDE68A';
  ctx.font = '700 20px Montserrat, sans-serif';
  ctx.fillText(competition, width / 2, 57);

  // Escudos nas laterais
  const shieldsY = height * 0.56;
  const leftX = width * 0.17;
  const rightX = width * 0.83;
  const radius = 84;

  const oppInitials = opponent
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join('') || 'ADV';

  drawShieldCircle(ctx, leftX, shieldsY, radius, clubImg, 'IFC', '#C8102E', '#FFFFFF');
  drawShieldCircle(ctx, rightX, shieldsY, radius, oppImg, oppInitials, '#FFFFFF', '#1F2937');

  ctx.fillStyle = 'rgba(20, 20, 22, 0.9)';
  ctx.fillRect(leftX - 115, shieldsY + radius + 12, 230, 34);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px Montserrat, sans-serif';
  ctx.fillText('IMPERATRIZ', leftX, shieldsY + radius + 35);

  ctx.fillStyle = 'rgba(20, 20, 22, 0.9)';
  ctx.fillRect(rightX - 115, shieldsY + radius + 12, 230, 34);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 18px Montserrat, sans-serif';
  ctx.fillText(opponent.toUpperCase().slice(0, 18), rightX, shieldsY + radius + 35);

  // Placar no modo resultado final
  if (mode === 'resultado') {
    ctx.fillStyle = '#C8102E';
    ctx.fillRect(width / 2 - 115, shieldsY - 46, 230, 92);
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 4;
    ctx.strokeRect(width / 2 - 115, shieldsY - 46, 230, 92);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 52px Oswald, sans-serif';
    ctx.fillText(`${goalsFor}  ×  ${goalsAgainst}`, width / 2, shieldsY + 18);
  }

  // Faixa inferior com data, horário, local e gols
  const hasScorers = mode === 'resultado' && scorers;
  const barH = hasScorers ? 128 : 98;
  const barY = height - barH - 24;

  ctx.fillStyle = 'rgba(20, 20, 22, 0.94)';
  ctx.fillRect(44, barY, width - 88, barH);
  ctx.fillStyle = '#C8102E';
  ctx.fillRect(44, barY, 12, barH);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px Montserrat, sans-serif';
  ctx.fillText(datetime || 'Dia de Jogo', width / 2, barY + 34);

  ctx.fillStyle = '#FDE68A';
  ctx.font = '600 19px Montserrat, sans-serif';
  ctx.fillText(`📍 ${location}`, width / 2, barY + 66);

  if (hasScorers) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px Montserrat, sans-serif';
    ctx.fillText(`⚽ Gols: ${scorers}`, width / 2, barY + 98);
  }
}

function downloadMatchArt() {
  const canvas = document.getElementById('match-art-canvas');
  if (!canvas) return;

  try {
    const link = document.createElement('a');
    const oppSlug = (document.getElementById('art-opponent')?.value || 'jogo')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    link.download = `imperatriz-${oppSlug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Erro ao exportar PNG:', err);
    alert('Não foi possível exportar a imagem automaticamente (verifique a permissão CORS do Storage no Supabase). Você também pode clicar com o botão direito na arte e salvar a imagem.');
  }
}

// ==========================================
// 9. GALERIA DE FOTOS DO TIME (SUPABASE)
// ==========================================
const defaultGalleryPlaceholders = [
  { id: 'p1', title: 'Elenco Titular • Temporada 2026', category: 'Jogos', date: 'Nov 2026', imageUrl: '', isPlaceholder: true },
  { id: 'p2', title: 'Comemoração do Gol da Vitória', category: 'Jogos', date: 'Out 2026', imageUrl: '', isPlaceholder: true },
  { id: 'p3', title: 'Torcida Vermelha e Branca na Arquibancada', category: 'Torcida', date: 'Out 2026', imageUrl: '', isPlaceholder: true }
];

let galleryPhotos = [...defaultGalleryPlaceholders];
let currentGalleryFilter = 'todas';
let showGalleryPlaceholders = true;
let lightboxIndex = 0;

function getVisibleGalleryPhotos() {
  const base = showGalleryPlaceholders
    ? galleryPhotos
    : galleryPhotos.filter(item => !item.isPlaceholder);

  return currentGalleryFilter === 'todas'
    ? base
    : base.filter(item => item.category === currentGalleryFilter);
}

function toggleGalleryPlaceholders() {
  const checkbox = document.getElementById('show-gallery-placeholders');
  showGalleryPlaceholders = checkbox ? checkbox.checked : true;
  renderGallery();
}

async function fetchGalleryFromDB() {
  const { data, error } = await supabaseClient
    .from('gallery_photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar galeria:', error);
    renderGallery();
    return;
  }

  if (data && data.length > 0) {
    const dbPhotos = data.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      date: row.date_label,
      imageUrl: row.image_url,
      isPlaceholder: false
    }));
    galleryPhotos = [...dbPhotos, ...defaultGalleryPlaceholders];
  } else {
    galleryPhotos = [...defaultGalleryPlaceholders];
  }

  renderGallery();
}

function renderGallery(filter = currentGalleryFilter) {
  currentGalleryFilter = filter;
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const filtered = getVisibleGalleryPhotos();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <p class="font-display text-xl font-bold uppercase text-gray-500">Nenhuma foto nesta categoria</p>
        <p class="text-xs text-gray-400 mt-1">Clique em "Adicionar Foto do Time" para enviar uma imagem.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((item, idx) => `
    <div class="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 card-hover flex flex-col">
      <div onclick="openLightbox(${idx})" class="cursor-pointer relative h-60 overflow-hidden bg-gradient-to-br from-imperatriz-darkRed via-imperatriz-red to-gray-900 flex flex-col items-center justify-center p-6 text-center text-white">
        ${item.imageUrl ? `
          <img src="${item.imageUrl}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
        ` : `
          <div class="w-16 h-16 rounded-full bg-white/15 border-2 border-dashed border-white/60 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="text-xs font-extrabold uppercase tracking-widest text-white/90">Espaço Reservado</span>
          <span class="text-[11px] text-white/70 mt-1">Clique em "Adicionar Foto do Time"</span>
        `}
        <span class="absolute top-3 left-3 bg-white text-imperatriz-red text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded shadow">
          ${item.category}
        </span>
      </div>

      <div class="p-4 flex items-center justify-between gap-2 flex-1">
        <div onclick="openLightbox(${idx})" class="cursor-pointer min-w-0">
          <h3 class="font-display text-lg font-bold uppercase text-gray-900 group-hover:text-imperatriz-red transition truncate">${item.title}</h3>
          <span class="text-xs font-semibold text-gray-400">📅 ${item.date}</span>
        </div>

        <div class="flex items-center gap-1 shrink-0">
          ${!item.isPlaceholder ? `
            <button type="button" onclick="openEditGalleryModal(${item.id})" class="p-1.5 rounded-md text-gray-500 hover:text-imperatriz-red hover:bg-red-50 transition" title="Editar legenda e categoria">
              ✏️
            </button>
            <button type="button" onclick="deleteGalleryPhoto(${item.id})" class="p-1.5 rounded-md text-gray-500 hover:text-red-700 hover:bg-red-50 transition" title="Excluir foto">
              🗑️
            </button>
          ` : `
            <button type="button" onclick="openLightbox(${idx})" class="text-imperatriz-red font-bold text-xs uppercase px-2 py-1">Ampliar →</button>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

function filterGallery(category) {
  document.querySelectorAll('.gal-filter-btn').forEach(btn => {
    if (btn.dataset.galFilter === category) {
      btn.className = 'gal-filter-btn px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider bg-imperatriz-red text-white transition';
    } else {
      btn.className = 'gal-filter-btn px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white text-gray-700 border border-gray-200 hover:border-imperatriz-red hover:text-imperatriz-red transition';
    }
  });
  renderGallery(category);
}

function openEditGalleryModal(photoId) {
  const photo = galleryPhotos.find(p => !p.isPlaceholder && p.id === photoId);
  if (!photo) return;

  document.getElementById('edit-gallery-id').value = photo.id;
  document.getElementById('edit-gallery-title').value = photo.title;
  document.getElementById('edit-gallery-category').value = photo.category || 'Jogos';
  document.getElementById('edit-gallery-modal').classList.remove('hidden');
}

function closeEditGalleryModal() {
  document.getElementById('edit-gallery-modal').classList.add('hidden');
}

const editGalleryForm = document.getElementById('edit-gallery-form');
if (editGalleryForm) {
  editGalleryForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const photoId = Number(document.getElementById('edit-gallery-id').value);
    const title = document.getElementById('edit-gallery-title').value.trim();
    const category = document.getElementById('edit-gallery-category').value;
    const submitBtn = document.getElementById('edit-gallery-submit-btn');

    if (!title || !photoId) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      const { error } = await supabaseClient
        .from('gallery_photos')
        .update({ title, category })
        .eq('id', photoId);

      if (error) throw error;

      const photo = galleryPhotos.find(p => !p.isPlaceholder && p.id === photoId);
      if (photo) {
        photo.title = title;
        photo.category = category;
      }

      renderGallery();
      closeEditGalleryModal();
    } catch (err) {
      console.error('Erro ao editar foto:', err);
      alert(`Não foi possível salvar as alterações da foto: ${err.message || 'tente novamente.'}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar';
    }
  });
}

async function deleteGalleryPhoto(photoId) {
  const photo = galleryPhotos.find(p => !p.isPlaceholder && p.id === photoId);
  if (!photo) return;

  if (!confirm(`Deseja excluir a foto "${photo.title}" da galeria?`)) return;

  try {
    const { error } = await supabaseClient
      .from('gallery_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    galleryPhotos = galleryPhotos.filter(p => p.isPlaceholder || p.id !== photoId);
    renderGallery();
  } catch (err) {
    console.error('Erro ao excluir foto da galeria:', err);
    alert(`Não foi possível excluir a foto: ${err.message || 'verifique a política de DELETE no Supabase.'}`);
  }
}

const photoUploadInput = document.getElementById('photo-upload-input');
if (photoUploadInput) {
  photoUploadInput.addEventListener('change', async function (e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const uploadLabel = document.getElementById('gallery-upload-label');
    uploadLabel.innerHTML = '<span>⏳ Enviando fotos...</span>';

    try {
      for (const file of files) {
        const publicUrl = await uploadImageToStorage(file, 'galeria');
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const dateLabel = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

        const { error } = await supabaseClient
          .from('gallery_photos')
          .insert([{ title, category: 'Jogos', date_label: dateLabel, image_url: publicUrl }]);

        if (error) throw error;
      }

      await fetchGalleryFromDB();
      filterGallery('todas');
    } catch (err) {
      console.error('Erro ao salvar foto na galeria:', err);
      alert(`Não foi possível salvar a foto na galeria: ${err.message || 'verifique as permissões do Storage no Supabase.'}`);
    } finally {
      uploadLabel.innerHTML = '<span>📸 Adicionar Foto do Time</span>';
      e.target.value = '';
    }
  });
}

function openLightbox(index) {
  const filtered = getVisibleGalleryPhotos();
  lightboxIndex = index;
  const item = filtered[lightboxIndex];
  if (!item) return;

  const mediaContainer = document.getElementById('lightbox-media');
  if (item.imageUrl) {
    mediaContainer.innerHTML = `<img src="${item.imageUrl}" alt="${item.title}" class="max-h-[70vh] w-auto object-contain">`;
  } else {
    mediaContainer.innerHTML = `
      <div class="p-12 text-center text-white">
        <p class="font-display text-3xl uppercase text-imperatriz-crimson mb-2">Espaço Reservado para Foto</p>
        <p class="text-sm text-gray-300">Use o botão <strong>"Adicionar Foto do Time"</strong> para inserir uma imagem real aqui.</p>
      </div>
    `;
  }

  document.getElementById('lightbox-badge').textContent = item.category;
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-date').textContent = item.date;
  document.getElementById('lightbox-modal').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox-modal').classList.add('hidden');
}

function navigateLightbox(step) {
  const filtered = getVisibleGalleryPhotos();
  lightboxIndex = (lightboxIndex + step + filtered.length) % filtered.length;
  openLightbox(lightboxIndex);
}

// ==========================================
// 10. FORMULÁRIO DE AMISTOSOS (SUPABASE + WHATSAPP)
// ==========================================
function buildWhatsAppUrl({ team, contact, phone, dateFormatted, location }) {
  const cleanPhone = CLUB_WHATSAPP.replace(/\D/g, '');
  const message =
    `Olá, diretoria do *Imperatriz Futebol e Samba*! ⚽🔴⚪\n` +
    `Gostaria de agendar um amistoso:\n` +
    `• *Time:* ${team}\n` +
    `• *Responsável:* ${contact}\n` +
    `• *WhatsApp:* ${phone}\n` +
    `• *Data sugerida:* ${dateFormatted}\n` +
    `• *Local:* ${location}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

async function fetchFriendlyMatchesFromDB() {
  const listWrap = document.getElementById('friendly-list-wrap');
  const listEl = document.getElementById('friendly-list');
  if (!listWrap || !listEl) return;

  const { data, error } = await supabaseClient
    .from('friendly_matches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    listWrap.classList.add('hidden');
    return;
  }

  listWrap.classList.remove('hidden');
  listEl.innerHTML = data.map(item => `
    <div class="flex flex-wrap items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
      <div>
        <strong class="text-gray-900">${item.team_name}</strong>
        <span class="text-gray-500"> • ${item.contact_name} (${item.contact_phone})</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-bold text-imperatriz-red">${formatDateBR(item.match_date)} • ${item.location}</span>
        <button type="button" onclick="deleteFriendlyMatch(${item.id})" class="p-1 rounded text-gray-500 hover:text-red-700 hover:bg-red-50 transition" title="Excluir convite">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

async function deleteFriendlyMatch(friendlyId) {
  if (!confirm('Deseja excluir este convite de amistoso?')) return;

  try {
    const { error } = await supabaseClient
      .from('friendly_matches')
      .delete()
      .eq('id', friendlyId);

    if (error) throw error;

    await fetchFriendlyMatchesFromDB();
  } catch (err) {
    console.error('Erro ao excluir convite:', err);
    alert(`Não foi possível excluir o convite: ${err.message || 'verifique a política de DELETE no Supabase.'}`);
  }
}

const friendlyForm = document.getElementById('friendly-form');
if (friendlyForm) {
  friendlyForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const team = document.getElementById('team-name').value.trim();
    const contact = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const date = document.getElementById('match-date').value;
    const location = document.getElementById('match-location').value;
    const dateFormatted = date.split('-').reverse().join('/');

    const submitBtn = document.getElementById('friendly-submit-btn');
    const feedback = document.getElementById('form-feedback');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const waUrl = buildWhatsAppUrl({ team, contact, phone, dateFormatted, location });

    try {
      const { error } = await supabaseClient
        .from('friendly_matches')
        .insert([{
          team_name: team,
          contact_name: contact,
          contact_phone: phone,
          match_date: date,
          location,
          status: 'pendente'
        }]);

      if (error) throw error;

      feedback.innerHTML = `
        <p>✅ Valeu, <strong>${contact}</strong>! Convite do <strong>${team}</strong> para <strong>${dateFormatted}</strong> (${location}) salvo no banco.</p>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider transition">
          💬 Abrir Conversa no WhatsApp
        </a>
      `;
      feedback.classList.remove('hidden');
      this.reset();
      await fetchFriendlyMatchesFromDB();
    } catch (err) {
      console.error('Erro ao salvar amistoso:', err);
      feedback.innerHTML = `
        <p class="text-amber-900">⚠️ Não foi possível salvar no banco agora, mas você ainda pode enviar direto pelo WhatsApp:</p>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-extrabold uppercase tracking-wider transition">
          💬 Enviar pelo WhatsApp
        </a>
      `;
      feedback.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar Convite e Abrir WhatsApp';
    }
  });
}

// ==========================================
// 11. INICIALIZAÇÃO AO ABRIR O SITE
// ==========================================
fetchClubLogoFromDB();
fetchPlayersFromDB();
fetchMatchesFromDB();
fetchGalleryFromDB();
fetchFriendlyMatchesFromDB();