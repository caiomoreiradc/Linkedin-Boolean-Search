document.body.style.overflow = 'hidden';

document.getElementById('searchType').addEventListener('change', function () {
    const searchType = document.getElementById('searchType').value;

    // Desabilitar checkboxes se o tipo de pesquisa for candidatos
    if (searchType === 'candidatos') {
        document.getElementById('remote').disabled = true;
        document.getElementById('simplificada').disabled = true;
    } else {
        // Habilitar checkboxes se o tipo de pesquisa não for candidatos
        document.getElementById('remote').disabled = false;
        document.getElementById('simplificada').disabled = false;
    }
});

document.getElementById('searchButton').addEventListener('click', function () {
    // Obter os valores digitados
    const searchType = document.getElementById('searchType').value;
    const jobTitles = document.getElementById('jobTitle').value.split(',').map(title => title.trim()).filter(title => title !== '');
    const jobLevel = document.getElementById('experienceLevel').value;
    const jobIgnore = document.getElementById('jobIgnore').value.split(',').map(ignore => ignore.trim()).filter(ignore => ignore !== '');

    // Obter Checkboxes checked value
    const remoteOnly = document.getElementById('remote').checked;
    const candidaturaSimplificada = document.getElementById('simplificada').checked;

    // geoId do Brasil
    const isBrasil = 106057199;

    // Adicionar geoId para buscar vagas por país
    const geoId = document.getElementById('countryId').value;

    // Validação de campos obrigatorios
    if (jobTitles.length === 0 || !jobLevel) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return; 
    }

    // Traduções 
    const jobLevelTranslations = {
        'estágio': ['Intern', 'Int'],
        'junior': ['Junior', 'Jr'],
        'pleno': ['Mid-level', 'Mid'],
        'sênior': ['Senior', 'Sr'],
        'trainee': ['Trainee']
    };

    // Função para criar a query com nome completo e abreviação
    function buildJobLevelQuery(jobLevel, geoId) {
        if (geoId == isBrasil) {
            if (jobLevel === 'pleno') {
                return `"Pleno"`; // Agora inclui  pleno para o Brasil
            } else if (jobLevel === 'junior') {
                return `"Júnior" OR "Jr"`;
            } else if (jobLevel === 'sênior') {
                return `"Sênior" OR "Sr"`;
            } else if (jobLevel === 'estágio') {
                return `"Estagiário" OR "Estágio"`;
            } else if (jobLevel === 'trainee') {
                return `"Trainee"`;
            }
        } else {
            // fora do Brasil usa as traduções e abreviações
            const translations = jobLevelTranslations[jobLevel];
            if (translations) {
                const [englishLevel, abbreviation] = translations;
                return `"${englishLevel}" OR "${abbreviation}"`;
            } else if (jobLevel === 'pleno') {
                return `"Mid-level" OR "Mid"`;  // garante que fora do Brasil seja tratado como Mid-level pois tava dando pau
            }
        }
        return `"${jobLevel}"`; 
    }

    // Configurar abreviações 
    const jobLevelQuery = buildJobLevelQuery(jobLevel, geoId);

    // define a query padrão 
    var booleanSearch = jobTitles.map(title => {
        return `"${title}" AND (${jobLevelQuery})`;
    }).join(' OR ');

    // modificar o query para pleno fora do brasil
    if (geoId != isBrasil && jobLevel === 'pleno') {
        booleanSearch = jobTitles.map(title => `"${title}" AND ("Mid-level" OR "Mid")`).join(' OR ');
    }

    // cria a searchQuery
    let searchQuery = `${booleanSearch}`;

    // Aadicionar 'AND NOT' se houver valores no campo jobIgnore
    if (jobIgnore.length > 0) {
        const ignoreSearch = jobIgnore.map(ignore => `"${ignore}"`).join(' OR ');
        searchQuery += ` AND NOT (${ignoreSearch})`;
    }

    // criar URL base
    var baseUrl = `https://www.linkedin.com/`;

    // construir URL para vaga
    var url = `${baseUrl}jobs/search/?keywords=${encodeURIComponent(searchQuery)}&geoId=${encodeURIComponent(geoId)}`;

    if (candidaturaSimplificada) {
        url += '&f_AL=true';
    }

    if (searchType === 'candidatos') {
        // atualiza a url para candidatos
        url = `${baseUrl}search/results/people/?keywords=${encodeURIComponent(searchQuery)}&geoUrn=${encodeURIComponent(geoId)}`; // geoId de pessoas é geoUrn
    }

    if (remoteOnly) {
        url += '&f_WT=2';
    }

    // cria a guia
    console.log(url);
    chrome.tabs.create({ url: url });
});
