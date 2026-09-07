(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    root.PassageSelfLogic = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    const AFTER_13H = new Set(['13h30', '14h00', '14h30', '15h00']);
    const PRIORITY_3_GROUPS = new Set(['Théâtre', 'Atelier Nature', 'Chorale']);

    function rotateClasses(classes, weekNumber) {
        if (classes.length < 2) return [...classes];
        const offset = Math.abs(Number(weekNumber) || 0) % classes.length;
        return [...classes.slice(offset), ...classes.slice(0, offset)];
    }

    function getRotationWeekNumber(currentWeekNumber, selectedWeekType) {
        const currentWeek = Number(currentWeekNumber) || 0;
        const currentWeekType = currentWeek % 2 === 0 ? 'A' : 'B';
        return selectedWeekType === currentWeekType ? currentWeek : currentWeek + 1;
    }

    function clonePlanning(planning) {
        return planning.map((slot) => ({ ...slot, classes: [...slot.classes] }));
    }

    function isValidPlanning(planning) {
        if (!Array.isArray(planning) || planning.length !== 2) return false;
        const classNames = new Set();
        return planning.every((slot) => {
            if (!slot || typeof slot.id !== 'string' || !Array.isArray(slot.classes)) return false;
            return slot.classes.every((className) => {
                if (className === 'SEPARATOR') return true;
                if (typeof className !== 'string' || classNames.has(className)) return false;
                classNames.add(className);
                return true;
            });
        });
    }

    function isActiveClass(classInfo, day, settings) {
        if (classInfo.lvl === 'club' && !settings[classInfo.name]?.[day]) return false;
        if (classInfo.name.includes('CHAM') && day !== 'MARDI' && day !== 'JEUDI') return false;
        return true;
    }

    function generate({ classes, settings, day, weekType, weekNumber }) {
        const p1 = [];
        const p2 = [];
        const p3Groups = [];
        const p3 = [];
        const p4 = [];
        const seenClasses = new Set();

        classes.forEach((classInfo) => {
            if (seenClasses.has(classInfo.name) || !isActiveClass(classInfo, day, settings)) return;
            seenClasses.add(classInfo.name);

            const schedule = settings[classInfo.name]?.[day]?.[weekType] || {};
            if (schedule.fin === '11h00') {
                p1.push(classInfo.name);
            } else if (schedule.fin === '11h30') {
                p2.push(classInfo.name);
            } else if (schedule.reprise === '13h00') {
                if (PRIORITY_3_GROUPS.has(classInfo.name) || classInfo.name.includes('CHAM')) {
                    p3Groups.push(classInfo.name);
                } else {
                    p3.push(classInfo.name);
                }
            } else if (AFTER_13H.has(schedule.reprise)) {
                p4.push(classInfo);
            }
        });

        let p4Classes;
        if (day === 'LUNDI' || day === 'MARDI') {
            const sixiemes = p4.filter((classInfo) => classInfo.lvl === '6').map((classInfo) => classInfo.name);
            const otherClasses = p4.filter((classInfo) => classInfo.lvl !== '6').map((classInfo) => classInfo.name);
            p4Classes = [...sixiemes, ...rotateClasses(otherClasses, weekNumber)];
        } else {
            p4Classes = rotateClasses(p4.map((classInfo) => classInfo.name), weekNumber);
        }

        const slot1Classes = [...p1, ...p2];
        const slot2Classes = [...p3Groups, ...p3];
        if (slot2Classes.length && p4Classes.length) slot2Classes.push('SEPARATOR');
        slot2Classes.push(...p4Classes);

        return [
            { id: 'slot1', time: '11h30', classes: slot1Classes },
            { id: 'slot2', time: '12h00', classes: slot2Classes }
        ];
    }

    return { clonePlanning, generate, getRotationWeekNumber, isValidPlanning, rotateClasses };
});
