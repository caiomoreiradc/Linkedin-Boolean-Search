document.getElementById('searchButton').addEventListener('click', function() {
    // Obter os valores digitados
    const jobTitles = document.getElementById('jobTitle').value.split(',').map(title => title.trim()).filter(title => title !== '');
    const jobLevel = document.getElementById('experienceLevel').value;
    const jobIgnore = document.getElementById('jobIgnore').value.split(',').map(ignore => ignore.trim()).filter(ignore => ignore !== '');
    const remoteOnly = document.getElementById('remote').checked;

    // Validação
    if (jobTitles.length === 0 || !jobLevel) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return; // Não prosseguir com a ação se a validação falhar
    }

    // Construir a string de pesquisa booleana
    const booleanSearch = jobTitles.map(title => `"${title}" AND ${jobLevel}`).join(' OR ');
    let searchQuery = `${booleanSearch}`;

    if (remoteOnly) {
        searchQuery += ' AND remote';
    }

    // Adicionar 'AND NOT' se houver valores no campo jobIgnore
    if (jobIgnore.length > 0) {
        const ignoreSearch = jobIgnore.map(ignore => `"${ignore}"`).join(' OR ');
        searchQuery += ` AND NOT (${ignoreSearch})`;
    }

    // Abrir uma nova aba com a busca no LinkedIn
    const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}`;
    chrome.tabs.create({ url: url });
});
