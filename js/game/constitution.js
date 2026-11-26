// The separation of powers (constitution as amended in 1974).
//  President: nominates the PM; appoints the Secretaries of State, Defense and
//    the Treasury (Senate advice and consent); judges, the CIA director, the
//    Joint Chiefs and the Fed chair (Senate consent); executive orders; vetoes
//    (overridden by 2/3 of the House and a simple Senate majority); dissolves
//    Congress, but not within 4 years of a government's formation unless the
//    PM asks and both chambers agree, or a new President has taken office.
//  The PM and cabinet need not sit in Congress; they only need the House's investiture.
//  House: invests the PM: first nominee needs an absolute majority, second
//    nominee a simple majority; then 3 months of open talks or a new election.
//  Senate: chooses a caretaker cabinet when both nominees fail (VP breaks
//    ties); vetoes House bills with 2/3 or delays them up to 2 years with a
//    simple majority; cannot touch budgets; impeaches the President with 2/3.
//  No-confidence votes are constructive: the motion names a new PM, who needs
//    an absolute majority of the House.
(function (G) {
  'use strict';
  var U = G.USA, C = U.Coalition, S = U.Game, K = U.Content, H = K.H, F = U.Flow, Ev = U.Events, X = U.Elections;
  var R = function () { return U.RULES.constitution; };
  var short = function (p) { return (U.PARTIES[p] || {}).short || p; };

  // ---- Senate votes: simple majority, the Vice President breaks ties ----
  S.senateCount = function (Q, decide) {
    var s = U.Parliament.count(Q, 'senate', decide);
    s.total = U.sum(X.senateCount(Q));
    if (s.yes === s.no && Q.offices && Q.offices.vp) s.vp = decide(Q.offices.vp.party);
    s.passes = s.yes > s.no || (s.yes === s.no && s.vp === 'yes');
    s.twoThirdsNo = s.no >= Math.ceil(s.total * 2 / 3);
    s.twoThirdsYes = s.yes >= Math.ceil(s.total * 2 / 3);
    return s;
  };

  // ---- government formation ----
  // stage 'nominee' (round 1: absolute majority; round 2: simple majority), then 'open'
  S.ballot = function (Q) { var f = Q.formation; return f && f.stage === 'nominee' && f.round === 1 ? 1 : 2; };
  S.tryInvestiture = function (Q, deal) {
    var c = C.investitureVote(Q, deal), b = S.ballot(Q);
    if (c && c.by) Q.lastVote = { title: 'Investiture of ' + S.leaderOf(Q, deal.pm), house: c, kind: 'investiture', need: b === 1 ? 'absolute' : 'simple', pmParty: deal.pm, passed: C.passes(c, b) };
    return { first: c, second: null, passed: C.passes(c, b), ballot: b };
  };
  // the President's choice: their own party if it can lead, else the closest viable party
  S.presidentNominee = function (Q) {
    var f = Q.formation, pp = Q.president.party;
    var cands = C.formateurs(Q).filter(function (p) { return f.failed.indexOf(p) < 0; });
    if (!cands.length) return null;
    return cands.map(function (p) {
      var deal = C.aiDeal(Q, p, []), seats = C.seats(Q, deal.coalition.concat(deal.cs));
      return { p: p, score: (p === pp ? 1.5 : 0) + C.compat(Q, p, pp) * 2 + seats / 300 };
    }).sort(function (a, b) { return b.score - a.score; })[0].p;
  };
  S.startFormation = function (Q) {
    Q.formation = { start: S.now(Q), stage: 'nominee', round: 1, monthsLeft: 99, failed: [], nominee: null };
    if (Q.gov) Q.gov.caretaker = true;
    S.nominate(Q);
  };
  S.nominate = function (Q) {
    var f = Q.formation; f.nominee = null; f.playerRefused = false;
    if (Q.president.party === Q.player) { S.note(Q, 'As the President’s party, the LDP chooses who the President nominates for Prime Minister' + (f.round === 2 ? ' (second nomination: a simple majority will do)' : ' (the House must confirm by an absolute majority)') + '.'); return; }
    var p = S.presidentNominee(Q);
    if (!p) { S.openTalks(Q); return; }
    f.nominee = p;
    S.note(Q, 'President ' + Q.president.name + ' nominates ' + S.pmName(Q, p) + ' (' + short(p) + ') for Prime Minister. ' + (f.round === 1 ? 'The House must confirm by an absolute majority.' : 'Second nomination: a simple majority will do.'));
  };
  S.formationFailed = function (Q, p) {
    var f = Q.formation; if (!f) return;
    if (p && f.failed.indexOf(p) < 0) f.failed.push(p);
    if (f.stage !== 'nominee') return;
    if (f.round === 1) { f.round = 2; S.nominate(Q); } else S.openTalks(Q);
  };
  S.openTalks = function (Q) {
    var f = Q.formation; f.stage = 'open'; f.nominee = null; f.monthsLeft = R().openTalksMonths; f.failed = [];
    S.note(Q, 'Both presidential nominees have failed. The House has ' + f.monthsLeft + ' months to agree a government, or a new election follows.');
    S.senateCaretaker(Q);
  };
  // the Senate picks a caretaker Prime Minister between the two largest Senate parties
  S.senateCaretaker = function (Q) {
    var sen = X.senateCount(Q), top = Object.keys(sen).filter(function (p) { return U.NATIONAL.indexOf(p) >= 0; }).sort(function (a, b) { return sen[b] - sen[a]; }).slice(0, 2);
    if (top.length < 2) return;
    var a = top[0], b = top[1];
    var s = S.senateCount(Q, function (p) { if (p === a) return 'yes'; if (p === b) return 'no'; var ca = C.compat(Q, p, a), cb = C.compat(Q, p, b); return ca > cb ? 'yes' : ca < cb ? 'no' : 'abstain'; });
    var w = s.passes ? a : b;
    Q.gov = { pm: S.pmName(Q, w), pmParty: w, coalition: [w], cs: [], posts: {}, concessions: {}, since: S.now(Q), budgetFails: 0, caretaker: true, senateCaretaker: true };
    Q.gov.posts[w] = 20; S.assignCabinet(Q);
    S.note(Q, 'The Senate appoints a caretaker cabinet under ' + Q.gov.pm + ' (' + short(w) + '), ' + s.yes + ' votes to ' + s.no + (s.vp ? ', with the Vice President breaking the tie' : '') + '.');
  };
  // AI formateurs: the nominee in nominee stages, anyone in open talks
  S.aiFormation = function (Q) {
    var f = Q.formation; if (!f || f.offer) return null;
    if (f.stage === 'nominee') {
      if (!f.nominee) { if (Q.president.party !== Q.player) S.nominate(Q); return null; } // the player (President's party) has not chosen yet
      if (f.nominee === Q.player) {                        // the player had the month to negotiate
        if (!f.playerTried) { S.note(Q, Q.leader.name + ' does not put a government before the House.'); S.formationFailed(Q, Q.player); }
        f.playerTried = false; return 'failed';
      }
      return S.aiTry(Q, f.nominee);
    }
    var cands = C.formateurs(Q).filter(function (p) { return p !== Q.player && f.failed.indexOf(p) < 0; });
    return cands.length ? S.aiTry(Q, cands[0]) : null;
  };
  S.aiTry = function (Q, pm) {
    var f = Q.formation, deal = C.aiDeal(Q, pm, f.playerRefused ? [Q.player] : []);
    if (!f.playerRefused && (deal.coalition.indexOf(Q.player) >= 0 || deal.cs.indexOf(Q.player) >= 0)) { f.offer = deal; return 'offer'; }
    var nm = S.pmName(Q, pm), inv = S.tryInvestiture(Q, deal);
    if (Q.lastVote && Q.lastVote.kind === 'investiture') Q.lastVote.title = 'Investiture of ' + nm;
    if (inv.passed) { S.formGovernment(Q, deal, nm); return 'formed'; }
    S.note(Q, S.pmName(Q, pm) + ' fails the investiture vote (' + inv.first.yes + ' yes, ' + inv.first.no + ' no' + (inv.ballot === 1 ? '; an absolute majority was needed' : '') + ').');
    if (f.stage === 'nominee') S.formationFailed(Q, pm); else f.failed.push(pm);
    return 'failed';
  };
  var pmName = S.pmName;
  S.pmName = function (Q, p) {
    var n = pmName(Q, p);
    if (Q.president && n === Q.president.name) { var ex = {}; ex[n] = 1; n = S.pickPerson(Q, p, ex, 'charisma'); }
    return n;
  };
  // a formed government locks out dissolution for four years
  var formGov = S.formGovernment;
  S.formGovernment = function (Q, deal, label) {
    formGov(Q, deal, label);
    Q.gov.lockUntil = S.now(Q) + R().dissolutionLockMonths;
    S.presidentialAppointments(Q);
  };
  // player-led talks: in nominee stages only the nominee may negotiate
  var canNeg = F.canNegotiate;
  F.canNegotiate = function (Q) {
    var f = Q.formation; if (!f) return false;
    if (f.stage === 'nominee' && f.nominee !== Q.player) return false;
    return canNeg(Q);
  };
  var submit = F.submitDeal;
  F.submitDeal = function (Q, deal) {
    var f = Q.formation, nominee = f && f.stage === 'nominee';
    if (nominee) f.playerTried = true;
    var r = submit(Q, deal);
    if (!r.passed && nominee) { S.note(Q, Q.leader.name + ' fails the investiture vote.'); S.formationFailed(Q, Q.player); }
    return r;
  };

  // ---- the three great offices: the President appoints, the Senate consents ----
  S.presidentialAppointments = function (Q) {
    var pp = Q.president.party; if (!Q.cabinet || !U.PARTIES[pp]) return;
    var used = {}; Q.cabinet.forEach(function (c) { used[c.name] = 1; });
    ['Treasury', 'State', 'Defense'].forEach(function (post) {
      var slot = Q.cabinet.filter(function (c) { return c.post === post; })[0]; if (!slot) return;
      var name = S.pickPerson(Q, pp, used, 'competence');
      used[name] = 1;
      slot.name = name; slot.party = pp; slot.by = 'president';
    });
    S.note(Q, 'The President\u2019s Secretaries of the Treasury, State and Defense are confirmed with the rest of the cabinet in the House investiture vote.');
  };

  // ---- budgets: the Senate cannot block them ----
  var budgetVote = S.budgetVote;
  S.budgetVote = function (Q, plan, playerVote) {
    var r = budgetVote(Q, plan, playerVote);
    r.passed = U.simple(r.house); r.override = false;
    return r;
  };

  // ---- dissolution ----
  S.canPresidentDissolve = function (Q) {
    var g = Q.gov; if (Q.electionAt || Q.formation) return false;
    return !g || S.now(Q) >= (g.lockUntil || 0) || (Q.newPresident && S.now(Q) - Q.newPresident < 12);
  };
  S.earlyElectionVote = function (Q) {
    var decide = function (p) { if (p === Q.player) return 'yes'; var t = (Q.trend[p] || 0); return S.supportsGov(Q, p) && C.rel(Q, p, Q.gov.pmParty) > 40 ? (t > -1 ? 'yes' : 'no') : (t > 0.5 ? 'yes' : 'no'); };
    var h = U.Parliament.count(Q, 'house', decide), s = S.senateCount(Q, decide);
    return { house: h, senate: s, passed: U.simple(h) && s.passes };
  };
  S.electionTiming = function (Q) {
    if (Q.electionAt || Q.formation) return;
    var now = S.now(Q), pp = Q.president.party;
    if (now >= Q.deadline) { S.note(Q, 'The legislature’s term is ending: the election must now be held.'); S.callElection(Q, 2); return; }
    if (pp === Q.player || !S.canPresidentDissolve(Q)) return;
    // an AI President dissolves when their party is doing well, or to escape a hostile government
    var hostile = Q.gov && !S.supportsGov(Q, pp);
    if ((Q.trend[pp] || 0) > 1 && U.rng(Q) < (hostile ? 0.25 : 0.08)) { S.note(Q, 'President ' + Q.president.name + ' dissolves Congress.'); S.callElection(Q, 2); }
  };
  var runPres = S.runPresidential;
  S.runPresidential = function (Q) {
    var old = Q.president.name, r = runPres(Q);
    if (Q.president.name !== old) { Q.newPresident = S.now(Q); if (Q.formation && Q.formation.stage === 'nominee' && !Q.formation.offer) S.nominate(Q); }
    return r;
  };
  var runGen = S.runGeneralElection;
  S.runGeneralElection = function (Q) {
    var r = runGen(Q); Q.newPresident = null; S.startFormation(Q); return r;
  };

  // ---- constructive votes of no confidence ----
  S.constructiveVote = function (Q, pm, playerVote) {
    var deal = C.aiDeal(Q, pm, pm === Q.player ? [] : []);
    var c = C.investitureVote(Q, deal);
    if (playerVote && pm !== Q.player) { /* the player's own vote is set by the caller's choice */ }
    return { deal: deal, count: c, passed: U.absolute(c) };
  };
  S.confidenceCheck = function (Q) {
    var g = Q.gov; if (!g || Q.formation || Q.electionAt) return;
    if (S.govSeats(Q) >= U.majority() && g.budgetFails < 2) return;
    if (U.rng(Q) > (g.budgetFails >= 2 ? 0.5 : 0.1)) return;
    var alt = C.formateurs(Q).filter(function (p) { return p !== g.pmParty && p !== Q.player; })[0]; if (!alt) return;
    var v = S.constructiveVote(Q, alt);
    S.note(Q, 'A constructive vote of no confidence proposes ' + S.pmName(Q, alt) + ' (' + short(alt) + ') as Prime Minister: ' + v.count.yes + ' for, ' + v.count.no + ' against.');
    if (v.passed) { S.note(Q, g.pm + '’s government falls.'); S.formGovernment(Q, v.deal, S.pmName(Q, alt)); }
  };

  // ---- legislation: Senate veto (2/3) or delay (simple majority); presidential veto ----
  // returns {status: 'law'|'delayed'|'senateVeto'|'presVeto'|'defeated', text}
  S.legislativeProcess = function (Q, h, s, presObjects) {
    var R0 = R();
    if (!U.simple(h)) return { status: 'defeated', text: 'The House rejects the bill.' };
    var sv = S.senateFromCount(Q, s);
    if (sv.no >= Math.ceil(sv.total * R0.senateVetoShare)) return { status: 'senateVeto', text: 'The Senate vetoes the bill with a two-thirds majority (' + sv.no + ' of ' + sv.total + ').' };
    if (presObjects) {
      var hOver = h.yes >= Math.ceil(U.RULES.house.total * R0.vetoOverrideHouseShare), sOver = sv.passes;
      if (!(hOver && sOver)) return { status: 'presVeto', text: 'President ' + Q.president.name + ' vetoes the bill. An override needs two-thirds of the House (' + Math.ceil(U.RULES.house.total * R0.vetoOverrideHouseShare) + ') and a Senate majority.' };
    }
    if (!sv.passes) return { status: 'delayed', text: 'The Senate votes it down (' + sv.yes + '–' + sv.no + '), delaying it by up to ' + R0.senateDelayMonths / 12 + ' years.' };
    return { status: 'law', text: '' };
  };
  S.senateFromCount = function (Q, s) {
    var t = U.sum(X.senateCount(Q)), o = { yes: s.yes, no: s.no, total: t };
    o.passes = s.yes > s.no || (s.yes === s.no && s.vp === 'yes'); return o;
  };

  // ---- Presidential powers as events ----
  var at = function (Q, y, m) { return Q.year > y || (Q.year === y && Q.month >= m); };
  var playerSenators = function (Q) { return X.senateCount(Q)[Q.player] || 0; };
  // A Senate confirmation vote where the player's senators decide their line.
  S.confirmVote = function (Q, nomineeParty, playerLine) {
    return S.senateCount(Q, function (p) {
      if (p === Q.player) return playerLine;
      if (p === nomineeParty || p === Q.president.party) return 'yes';
      return C.compat(Q, p, nomineeParty) > 0.55 ? 'yes' : C.compat(Q, p, nomineeParty) > 0.4 ? 'abstain' : 'no';
    });
  };
  function confirmation(id, title, office, chance, groupsYes) {
    return { id: id, title: title, repeat: true,
      when: function (Q) { if (!(!Q.formation && !Q.electionAt && Q.gov && (Q.month % 3 === 1) && (!Q.lastConf || S.now(Q) - Q.lastConf > 8) && U.rng(Q) < chance)) return false;
        Q.lastConf = S.now(Q); var pp = Q.president.party; Q.confNominee = { name: S.pickPerson(Q, pp, {}, 'competence'), party: pp, office: office }; return true; },
      body: function (Q) { var n = Q.confNominee.name, pp = Q.confNominee.party;
        return 'President ' + Q.president.name + ' nominates ' + n + ' (' + short(pp) + ') as ' + office + '. The Senate must give its advice and consent. The LDP holds ' + playerSenators(Q) + ' Senate seats.'; },
      options: [
        { label: 'Vote to confirm', sub: 'Goodwill with the President’s party.', act: function (Q) { return resolve(Q, 'yes'); } },
        { label: 'Vote against', sub: 'Your base may approve if the nominee is from a rival party.', act: function (Q) { return resolve(Q, 'no'); } }
      ] };
    function resolve(Q, line) {
      var c = Q.confNominee, s = S.confirmVote(Q, c.party, line);
      C.addRel(Q, Q.player, c.party, line === 'yes' ? 4 : -4);
      if (line === 'no' && c.party !== Q.player) Q.morale += 2;
      if (s.passes) { if (groupsYes) H.camp(Q, line === 'yes' ? groupsYes : {}, office + ' confirmation'); return c.name + ' is confirmed as ' + c.office + ', ' + s.yes + ' to ' + s.no + (s.vp ? ' (the Vice President broke the tie)' : '') + '.'; }
      Q.president.approval -= 3; return 'The Senate rejects ' + c.name + ', ' + s.yes + ' to ' + s.no + '. The President must find another nominee.';
    }
  }
  Ev.LIST.push(
    confirmation('court', 'A Supreme Court vacancy', 'Associate Justice of the Supreme Court', 0.12, { prof: 0.2 }),
    confirmation('fed', 'Chair of the Federal Reserve', 'Chair of the Federal Reserve', 0.06, { suburb: 0.2 }),
    confirmation('cia', 'Director of Central Intelligence', 'Director of the CIA', 0.05, null),
    confirmation('jcs', 'Chairman of the Joint Chiefs', 'Chairman of the Joint Chiefs of Staff', 0.05, { rural: 0.1 }),
    { id: 'exec_order', title: 'An executive order', repeat: true,
      when: function (Q) { if (!(!Q.formation && Q.gov && (!Q.lastEO || S.now(Q) - Q.lastEO > 10) && U.rng(Q) < 0.05)) return false;
        Q.lastEO = S.now(Q); var pos = U.Elections.pos(Q)[Q.president.party] || { econ: 0, soc: 0 };
        var list = pos.soc < 0 ? ['protects federal lands from drilling', 'bans discrimination in federal contracting', 'tightens workplace safety rules'] : ['expands drilling on federal land', 'freezes new federal regulations', 'tightens border enforcement'];
        Q.eo = { text: list[Math.floor(U.rng(Q) * list.length)], left: pos.soc < 0 }; return true; },
      body: function (Q) {
        return 'President ' + Q.president.name + ' signs an executive order that ' + Q.eo.text + '. It bypasses Congress. How does the LDP respond?'; },
      options: [
        { label: 'Back the order', sub: 'Pleases voters who agree with it.', act: function (Q) { H.camp(Q, Q.eo.left ? { young: 0.3, prof: 0.2 } : { rural: 0.3, suburb: 0.1 }, 'Executive order'); C.addRel(Q, Q.player, Q.president.party, 3); return 'The LDP backs the President.'; } },
        { label: 'Condemn executive overreach', sub: 'Defends Congress; the President is irritated.', act: function (Q) { H.camp(Q, Q.eo.left ? { rural: 0.2 } : { young: 0.3, prof: 0.3 }, 'Executive order'); C.addRel(Q, Q.player, Q.president.party, -4); return 'The LDP accuses the President of ruling by decree.'; } }
      ] },
    { id: 'impeach', title: 'Impeachment', repeat: true,
      when: function (Q) { return Q.president.party !== Q.player && Q.president.approval < 30 && (Q.scandal || 0) > 0 && !Q.formation && (!Q.lastImpeach || S.now(Q) - Q.lastImpeach > 24) && !!(Q.lastImpeach = S.now(Q)); },
      body: function (Q) { var t = U.sum(X.senateCount(Q)); return 'With President ' + Q.president.name + '’s approval at ' + Math.round(Q.president.approval) + '% and a scandal in the headlines, senators move to impeach. Removal needs ' + Math.ceil(t * 2 / 3) + ' of ' + t + ' votes.'; },
      options: [
        { label: 'Vote to remove', act: function (Q) { return S.impeach(Q, 'yes'); } },
        { label: 'Vote to acquit', act: function (Q) { return S.impeach(Q, 'no'); } }
      ] }
  );
  S.impeach = function (Q, line) {
    var pp = Q.president.party;
    var s = S.senateCount(Q, function (p) { if (p === Q.player) return line; if (p === pp || C.compat(Q, p, pp) > 0.6) return 'no'; return C.rel(Q, p, pp) < 30 ? 'yes' : 'abstain'; });
    C.addRel(Q, Q.player, pp, line === 'yes' ? -10 : 4);
    if (s.twoThirdsYes) {
      var old = Q.president.name, vp = Q.offices.vp;
      Q.president = { name: vp.name, party: vp.party, approval: 50, terms: 0, termLimited: false };
      Q.newPresident = S.now(Q);
      return 'The Senate removes ' + old + ', ' + s.yes + ' to ' + s.no + '. Vice President ' + vp.name + ' is sworn in.';
    }
    Q.president.approval += 4;
    return 'The impeachment fails: ' + s.yes + ' for removal, ' + s.no + ' against. Two-thirds were needed.';
  };

  // ---- the President's party chooses the nominee when that is the player ----
  Ev.LIST.unshift({ id: 'nominate', title: 'Who will the President nominate?', repeat: true,
    when: function (Q) { var f = Q.formation; return f && f.stage === 'nominee' && !f.nominee && Q.president.party === Q.player; },
    body: function (Q) { var f = Q.formation; return 'President ' + Q.president.name + ' is an LDP President, and the party decides who goes before the House. ' + (f.round === 1 ? 'The nominee needs an absolute majority (' + U.majority() + ' votes).' : 'The first nominee failed: this time a simple majority will do. If this fails too, the House gets three months and the Senate appoints a caretaker.'); },
    options: function (Q) {
      var f = Q.formation;
      return C.formateurs(Q).filter(function (p) { return f.failed.indexOf(p) < 0; }).map(function (p) {
        var me = p === Q.player;
        return { label: me ? 'Nominate ' + Q.leader.name + ' (LDP)' : 'Nominate ' + S.pmName(Q, p) + ' (' + short(p) + ')',
          sub: me ? 'Then build a majority at the negotiating table this month.' : 'Their party builds the government; you may be offered a role.',
          act: function (Q) { f.nominee = p; S.note(Q, 'President ' + Q.president.name + ' nominates ' + (me ? Q.leader.name : S.pmName(Q, p)) + ' for Prime Minister.'); return me ? 'Open the negotiating table to build a majority.' : S.pmName(Q, p) + ' will try to form a government.'; } };
      });
    } });
})(typeof globalThis !== 'undefined' ? globalThis : window);
