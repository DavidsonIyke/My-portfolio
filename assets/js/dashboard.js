document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidebar-nav a');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const STORAGE_KEY = 'davidsonProjects';

  const loadProjects = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Unable to load projects', error);
      return [];
    }
  };

  const saveProjects = (projects) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  };

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const updateDashboardSummary = () => {
    const projects = loadProjects();
    const countElement = document.getElementById('projectCount');
    const totalElement = document.getElementById('summaryTotalProjects');
    const completedElement = document.getElementById('summaryCompletedProjects');
    const activeElement = document.getElementById('summaryActiveProjects');
    const listElement = document.getElementById('dashboardProjectsList');

    if (countElement) {
      countElement.textContent = projects.length;
    }

    if (totalElement) {
      totalElement.textContent = projects.length;
    }

    if (completedElement) {
      completedElement.textContent = projects.filter((project) => project.status === 'Completed').length;
    }

    if (activeElement) {
      activeElement.textContent = projects.filter((project) => project.status === 'In Progress').length;
    }

    if (listElement) {
      if (!projects.length) {
        listElement.innerHTML = '<div class="empty-state">No projects yet. Add one from the management page to start building your portfolio.</div>';
        return;
      }

      listElement.innerHTML = projects
        .slice(0, 4)
        .map((project) => `
          <div class="project-item">
            <div>
              <h4>${escapeHtml(project.title)}</h4>
              <p>${escapeHtml(project.description || 'No description available yet.')}</p>
            </div>
            <span class="status ${project.status === 'Completed' ? 'done' : project.status === 'In Progress' ? 'in-progress' : 'planned'}">${escapeHtml(project.status)}</span>
          </div>
        `)
        .join('');
    }
  };

  const form = document.getElementById('projectForm');
  const projectIdInput = document.getElementById('projectId');
  const titleInput = document.getElementById('projectTitle');
  const categoryInput = document.getElementById('projectCategory');
  const descriptionInput = document.getElementById('projectDescription');
  const linkInput = document.getElementById('projectLink');
  const statusInput = document.getElementById('projectStatus');
  const submitButton = document.getElementById('projectSubmitButton');
  const formTitle = document.getElementById('projectFormTitle');
  const cancelButton = document.getElementById('cancelEditButton');
  const listElement = document.getElementById('projectManagerList');
  const badgeElement = document.getElementById('projectCountBadge');

  const resetForm = () => {
    if (form) {
      form.reset();
    }

    if (projectIdInput) {
      projectIdInput.value = '';
    }

    if (submitButton) {
      submitButton.textContent = 'Add project';
    }

    if (formTitle) {
      formTitle.textContent = 'Add a new project';
    }
  };

  const renderProjectManager = () => {
    const projects = loadProjects();

    if (badgeElement) {
      badgeElement.textContent = `${projects.length} item${projects.length === 1 ? '' : 's'}`;
    }

    if (!listElement) {
      return;
    }

    if (!projects.length) {
      listElement.innerHTML = '<div class="empty-state">No projects yet. Use the form to add your first project.</div>';
      return;
    }

    listElement.innerHTML = projects
      .map((project) => `
        <div class="project-manager-item">
          <div>
            <h4>${escapeHtml(project.title)}</h4>
            <p class="project-meta">${escapeHtml(project.category || 'General')}</p>
            <p>${escapeHtml(project.description || 'No description added yet.')}</p>
            ${project.link ? `<a class="project-link" href="${escapeHtml(project.link)}" target="_blank" rel="noreferrer">Open link</a>` : ''}
          </div>
          <div class="project-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${project.id}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${project.id}">Delete</button>
          </div>
        </div>
      `)
      .join('');
  };

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const projects = loadProjects();
      const projectData = {
        id: projectIdInput?.value || Date.now().toString(),
        title: titleInput?.value.trim() || 'Untitled Project',
        category: categoryInput?.value.trim() || 'General',
        description: descriptionInput?.value.trim() || '',
        link: linkInput?.value.trim() || '',
        status: statusInput?.value || 'Planned'
      };

      const existingIndex = projects.findIndex((project) => project.id === projectData.id);

      if (existingIndex >= 0) {
        projects[existingIndex] = projectData;
      } else {
        projects.unshift(projectData);
      }

      saveProjects(projects);
      resetForm();
      renderProjectManager();
      updateDashboardSummary();
    });
  }

  if (listElement) {
    listElement.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) {
        return;
      }

      const { action, id } = button.dataset;
      const projects = loadProjects();

      if (action === 'delete') {
        const confirmed = window.confirm('Delete this project?');
        if (!confirmed) {
          return;
        }

        const updatedProjects = projects.filter((project) => project.id !== id);
        saveProjects(updatedProjects);
        renderProjectManager();
        updateDashboardSummary();
        return;
      }

      if (action === 'edit') {
        const project = projects.find((item) => item.id === id);
        if (!project) {
          return;
        }

        if (projectIdInput) {
          projectIdInput.value = project.id;
        }
        if (titleInput) {
          titleInput.value = project.title;
        }
        if (categoryInput) {
          categoryInput.value = project.category;
        }
        if (descriptionInput) {
          descriptionInput.value = project.description;
        }
        if (linkInput) {
          linkInput.value = project.link;
        }
        if (statusInput) {
          statusInput.value = project.status;
        }
        if (submitButton) {
          submitButton.textContent = 'Save changes';
        }
        if (formTitle) {
          formTitle.textContent = 'Edit project';
        }
      }
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener('click', resetForm);
  }

  updateDashboardSummary();
  renderProjectManager();
});
