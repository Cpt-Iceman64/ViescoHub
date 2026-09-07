(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.CasiersLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const SOLO_PLACEHOLDER = 'X (Casier solo)';

    function text(value) {
        return typeof value === 'string' ? value.trim() : '';
    }

    function hasStudent(value) {
        const valueText = text(value);
        return valueText !== '' && valueText !== SOLO_PLACEHOLDER;
    }

    function hasAssignment(casier) {
        return hasStudent(casier.eleve1) || hasStudent(casier.eleve2);
    }

    function buildEmptyStructure(classes, maxCasiers, margeParClasse) {
        const max = Number(maxCasiers);
        const marge = Number(margeParClasse);

        if (!Number.isInteger(max) || max < 1) {
            return { ok: false, message: 'Le total de casiers doit être un nombre entier supérieur à zéro.' };
        }
        if (!Number.isInteger(marge) || marge < 0) {
            return { ok: false, message: 'La marge doit être un nombre entier positif ou nul.' };
        }

        const names = new Set();
        const casiers = [];
        let numero = 1;
        let totalEleves = 0;

        for (const classe of classes) {
            const nomClasse = text(classe.nomClasse);
            const effectif = Number(classe.effectif);

            if (nomClasse === '') {
                return { ok: false, message: 'Chaque classe doit avoir un nom.' };
            }
            if (names.has(nomClasse)) {
                return { ok: false, message: `La classe « ${nomClasse} » apparaît plusieurs fois.` };
            }
            names.add(nomClasse);

            if (!Number.isInteger(effectif) || effectif < 0) {
                return { ok: false, message: `L’effectif de ${nomClasse} doit être un nombre entier positif ou nul.` };
            }
            if (effectif === 0) continue;

            totalEleves += effectif;
            for (let eleve = 1; eleve <= effectif; eleve += 2) {
                if (numero > max) {
                    return { ok: false, message: `Limite atteinte (${max} casiers). Aucune modification n’a été enregistrée.` };
                }
                casiers.push({
                    numero,
                    classe: nomClasse,
                    eleve1: '',
                    eleve2: eleve + 1 > effectif ? SOLO_PLACEHOLDER : '',
                    estSolo: eleve + 1 > effectif,
                    estMarge: false
                });
                numero += 1;
            }

            for (let margeIndex = 0; margeIndex < marge; margeIndex += 1) {
                if (numero > max) break;
                casiers.push({ numero, classe: nomClasse, eleve1: '', eleve2: '', estSolo: false, estMarge: true });
                numero += 1;
            }
        }

        return { ok: true, casiers, totalEleves };
    }

    function copyAssignment(source, target) {
        target.eleve1 = typeof source.eleve1 === 'string' ? source.eleve1 : '';
        target.estSolo = Boolean(source.estSolo);
        target.eleve2 = target.estSolo
            ? SOLO_PLACEHOLDER
            : (typeof source.eleve2 === 'string' ? source.eleve2 : '');
        target.estMarge = Boolean(source.estMarge);
    }

    function rebuild(existingCasiers, classes, maxCasiers, margeParClasse) {
        const structure = buildEmptyStructure(classes, maxCasiers, margeParClasse);
        if (!structure.ok) return structure;

        const sourcesByClass = new Map();
        (Array.isArray(existingCasiers) ? existingCasiers : [])
            .filter(hasAssignment)
            .sort((left, right) => Number(left.numero) - Number(right.numero))
            .forEach(casier => {
                const classe = text(casier.classe);
                if (!sourcesByClass.has(classe)) sourcesByClass.set(classe, []);
                sourcesByClass.get(classe).push(casier);
            });

        const targetsByClass = new Map();
        structure.casiers.forEach(casier => {
            if (!targetsByClass.has(casier.classe)) targetsByClass.set(casier.classe, []);
            targetsByClass.get(casier.classe).push(casier);
        });

        for (const [classe, affectations] of sourcesByClass) {
            const targets = targetsByClass.get(classe) || [];
            if (affectations.length > targets.length) {
                return {
                    ok: false,
                    message: `La classe ${classe} possède ${affectations.length} casier(s) déjà attribué(s), mais la nouvelle configuration n’en prévoit que ${targets.length}. Augmentez son effectif ou la marge : aucune donnée n’a été modifiée.`
                };
            }
            affectations.forEach((source, index) => copyAssignment(source, targets[index]));
        }

        return {
            ok: true,
            casiers: structure.casiers,
            totalEleves: structure.totalEleves,
            totalAlloues: structure.casiers.length
        };
    }

    return { SOLO_PLACEHOLDER, hasAssignment, rebuild };
});
