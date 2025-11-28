export default {
  // SSR ist deaktiviert, aber wir brauchen Nitro für die HTML-Generierung
  preset: 'netlify',
  prerender: {
    routes: ['/'],
  },
};

