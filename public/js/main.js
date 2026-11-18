// main.js - Main application setup
(function() {
    const { createApp, ref, computed, onMounted } = Vue;

    const app = createApp({
        components: { NavBar: window.NavBar },
        setup() {
            const authHeader = ref(localStorage.getItem('v_auth') || '');
            const showDatabase = ref(true);

            const authenticated = computed(() => !!authHeader.value);
            
            // Show Nav only when authenticated
            const showNav = computed(() => authenticated.value);

            // Initialize configuration
            const initConfig = async () => {
                try {
                    const response = await fetch('/api/config');
                    if (response.ok) {
                        const config = await response.json();
                        if (config.background) {
                            document.documentElement.style.setProperty('--background-image', 'url(' + config.background + ')');
                            document.body.classList.add('has-background');
                        }
                        if (config.adminDatabaseView !== undefined) {
                            showDatabase.value = config.adminDatabaseView;
                        }
                    }
                } catch (error) {
                    console.log('Failed to load config:', error);
                }
            };

            const onLoginSuccess = (header) => {
                authHeader.value = header;
                localStorage.setItem('v_auth', header);
                // Router push is handled in LoginView, but we update state here
            };

            const onLogout = () => {
                localStorage.removeItem('v_auth');
                authHeader.value = '';
                window.router.push('/login');
            };

            onMounted(() => {
                initConfig();
            });

            return { 
                authHeader, authenticated, showNav, showDatabase,
                onLoginSuccess, onLogout
            };
        }
    });

    // Toasts: the host follows the data-theme attribute toggled by the navbar and login view
    const toastTheme = () => document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const toastHost = PlatformKitToast.mountToastHost({ theme: toastTheme() });
    new MutationObserver(() => toastHost.setTheme(toastTheme()))
        .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    app.use(window.router);
    app.mount('#app');
})();
