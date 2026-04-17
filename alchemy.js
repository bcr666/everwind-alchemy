let items = [];
let effects = [];
let effectsMap = {};
let translations = {};
let acknowledgements = [];
let currentLang = "en";

const SUPPORTED_LANGUAGES = ["en", "ru"];
const DEFAULT_LANGUAGE = "en";

const acknowledgementsButton = document.getElementById("acknowledgementsButton");
const acknowledgementsDialog = document.getElementById("acknowledgementsDialog");
const closeAcknowledgementsButton = document.getElementById("closeAcknowledgementsButton");
const acknowledgementsScroller = document.getElementById("acknowledgementsScroller");
const acknowledgementsList = document.getElementById("acknowledgementsList");

const itemSelect = document.getElementById("itemSelect");
const effectSelect = document.getElementById("effectSelect");
const effectSelect2 = document.getElementById("effectSelect2");
const effectSelect3 = document.getElementById("effectSelect3");
const itemResult = document.getElementById("itemResult");
const effectResult = document.getElementById("effectResult");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const languageSelect = document.getElementById("languageSelect");

let scrollAnimationId = null;
let autoScrollEnabled = false;
let autoScrollPaused = false;
let pixelsPerFrame = 0.35;

function openAcknowledgements() {
	if (!acknowledgementsDialog) {
		return;
	}

	acknowledgementsDialog.showModal();
	setupAcknowledgementsScroll();
}

function closeAcknowledgements() {
	stopAcknowledgementsScroll();

	if (acknowledgementsDialog) {
		acknowledgementsDialog.close();
	}
}

if (acknowledgementsButton) {
	acknowledgementsButton.addEventListener("click", openAcknowledgements);
}

if (closeAcknowledgementsButton) {
	closeAcknowledgementsButton.addEventListener("click", closeAcknowledgements);
}

if (acknowledgementsDialog) {
	acknowledgementsDialog.addEventListener("click", (event) => {
		const rect = acknowledgementsDialog.getBoundingClientRect();
		const clickedInside =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;

		if (!clickedInside) {
			closeAcknowledgements();
		}
	});
}

if (acknowledgementsScroller) {
	acknowledgementsScroller.addEventListener("mouseenter", () => {
		autoScrollPaused = true;
	});

	acknowledgementsScroller.addEventListener("mouseleave", () => {
		autoScrollPaused = false;
	});
}

function isAcknowledgementsOverflowing() {
	if (!acknowledgementsList || !acknowledgementsScroller) {
		return false;
	}

	return acknowledgementsList.scrollHeight > acknowledgementsScroller.clientHeight;
}

function setupAcknowledgementsScroll() {
	if (!acknowledgementsScroller) {
		return;
	}

	stopAcknowledgementsScroll();
	autoScrollPaused = false;
	acknowledgementsScroller.scrollTop = 0;

	if (!isAcknowledgementsOverflowing()) {
		autoScrollEnabled = false;
		acknowledgementsScroller.classList.add("is-static");
		return;
	}

	acknowledgementsScroller.classList.remove("is-static");
	autoScrollEnabled = true;
	scrollAnimationId = requestAnimationFrame(stepAcknowledgementsScroll);
}

function stopAcknowledgementsScroll() {
	autoScrollEnabled = false;

	if (scrollAnimationId !== null) {
		cancelAnimationFrame(scrollAnimationId);
		scrollAnimationId = null;
	}
}

function stepAcknowledgementsScroll() {
	if (!autoScrollEnabled || !acknowledgementsScroller || !acknowledgementsList) {
		return;
	}

	if (!autoScrollPaused) {
		acknowledgementsScroller.scrollTop += pixelsPerFrame;

		const firstItem = acknowledgementsList.firstElementChild;

		if (firstItem) {
			const itemStyle = window.getComputedStyle(firstItem);
			const itemMarginBottom = parseFloat(itemStyle.marginBottom) || 0;
			const firstItemHeight = firstItem.offsetHeight + itemMarginBottom;
			const firstItemBottom = firstItem.offsetTop + firstItem.offsetHeight;

			if (acknowledgementsScroller.scrollTop >= firstItemBottom) {
				acknowledgementsList.appendChild(firstItem);
				acknowledgementsScroller.scrollTop -= firstItemHeight;
			}
		}
	}

	scrollAnimationId = requestAnimationFrame(stepAcknowledgementsScroll);
}

function renderAcknowledgements(entries) {
	if (!acknowledgementsList) {
		return;
	}

	acknowledgementsList.innerHTML = "";

	entries.forEach(entry => {
		const li = document.createElement("li");

		const role = document.createElement("span");
		role.className = "ack-role";
		role.textContent = entry.contribution;

		const name = document.createElement("span");
		name.className = "ack-name";
		name.textContent = entry.name;

		li.appendChild(role);
		li.appendChild(name);
		acknowledgementsList.appendChild(li);
	});
}

function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function normalizeEffect(effect) {
	return String(effect ?? "").trim().toLowerCase();
}

function t(key) {
	return translations[key] ?? key;
}

function getLanguageName(langCode) {
	if (langCode === "ru") {
		return "Русский";
	}

	return "English";
}

function getPreferredLanguage() {
	const params = new URLSearchParams(window.location.search);
	const paramLang = params.get("lang");

	if (paramLang && SUPPORTED_LANGUAGES.includes(paramLang)) {
		return paramLang;
	}

	const savedLang = localStorage.getItem("everwind-language");

	if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
		return savedLang;
	}

	const browserLang = (navigator.language || "").toLowerCase();

	if (browserLang.startsWith("ru")) {
		return "ru";
	}

	return "en";
}

async function fetchJson(path) {
	const response = await fetch(path, { cache: "no-cache" });

	if (!response.ok) {
		throw new Error(`Failed to load ${path}`);
	}

	return response.json();
}

async function loadLanguage(lang) {
	const fallback = await fetchJson(`lang/${DEFAULT_LANGUAGE}.json`);

	if (lang === DEFAULT_LANGUAGE) {
		translations = fallback;
		return;
	}

	try {
		const selected = await fetchJson(`lang/${lang}.json`);
		translations = {
			...fallback,
			...selected
		};
	} catch (error) {
		translations = fallback;
	}
}

async function loadAcknowledgements() {
	acknowledgements = await fetchJson("acknowledgements.json");
}

function updateUrlLanguage(lang) {
	const url = new URL(window.location.href);
	url.searchParams.set("lang", lang);
	window.history.replaceState({}, "", url);
}

function applyStaticTranslations() {
	document.documentElement.lang = t("htmlLang");
	document.title = t("pageTitle");

	document.getElementById("appTitle").textContent = t("appTitle");
	document.getElementById("appSubtitle").textContent = t("appSubtitle");
	document.getElementById("languageLabel").textContent = t("languageLabel");
	document.getElementById("itemTabButton").textContent = t("itemTab");
	document.getElementById("effectTabButton").textContent = t("effectTab");
	document.getElementById("itemSelectLabel").textContent = t("selectItem");
	document.getElementById("effectSelectLabel").textContent = t("selectEffects");

	const acknowledgementsLabel = document.getElementById("acknowledgementsLabel");
	const acknowledgementsTitle = document.getElementById("acknowledgementsTitle");

	if (acknowledgementsLabel) {
		acknowledgementsLabel.textContent = t("acknowledgementsLabel");
	}

	if (acknowledgementsTitle) {
		acknowledgementsTitle.textContent = t("acknowledgementsTitle");
	}
}

function clearSelectOptions(select, defaultText) {
	select.innerHTML = "";
	const option = document.createElement("option");
	option.value = "";
	option.textContent = defaultText;
	select.appendChild(option);
}

function getEffectId(effect) {
	if (typeof effect === "string") {
		return effect;
	}

	return effect?.id || effect?.name || "";
}

function getEffectDisplayNameById(effectId) {
	const effect = effects.find(entry => getEffectId(entry) === effectId);

	if (!effect) {
		return effectId;
	}

	const translationKey = effect.nameKey || (effect.id ? `effect.${effect.id}` : "");

	if (translationKey && translations[translationKey]) {
		return translations[translationKey];
	}

	return effect.name || effect.id || effectId;
}

function getItemId(item) {
	return item?.id || item?.name || "";
}

function getItemDisplayName(item) {
	if (!item) {
		return "";
	}

	const translationKey = item.nameKey || (item.id ? `item.${item.id}` : "");

	if (translationKey && translations[translationKey]) {
		return translations[translationKey];
	}

	return item.name || item.id || "";
}

function getSpecialEffectText(item) {
	if (!item) {
		return "";
	}

	if (item.specialEffectKey && translations[item.specialEffectKey]) {
		return translations[item.specialEffectKey];
	}

	return item.specialEffect || "";
}

function buildEffectsMap() {
	effectsMap = {};

	effects.forEach(effect => {
		const effectId = getEffectId(effect);
		if (effectId) {
			effectsMap[effectId] = effect.image || "";
		}
	});
}

function getAllEffectIds() {
	const uniqueEffects = new Map();

	items.forEach(item => {
		(item.alchemyEffects || []).forEach(effect => {
			const effectId = getEffectId(effect);
			const key = normalizeEffect(effectId);

			if (!uniqueEffects.has(key)) {
				uniqueEffects.set(key, effectId);
			}
		});
	});

	return Array.from(uniqueEffects.values()).sort((a, b) => {
		return getEffectDisplayNameById(a).localeCompare(getEffectDisplayNameById(b), currentLang);
	});
}

function populateItemDropdown() {
	const sortedItems = [...items].sort((a, b) => {
		return getItemDisplayName(a).localeCompare(getItemDisplayName(b), currentLang);
	});

	const currentValue = itemSelect.value;
	clearSelectOptions(itemSelect, t("chooseItem"));

	sortedItems.forEach(item => {
		const option = document.createElement("option");
		option.value = getItemId(item);
		option.textContent = getItemDisplayName(item);
		itemSelect.appendChild(option);
	});

	if ([...itemSelect.options].some(option => option.value === currentValue)) {
		itemSelect.value = currentValue;
	}
}

function populateEffectDropdowns() {
	const allEffectIds = getAllEffectIds();
	const selects = [effectSelect, effectSelect2, effectSelect3];

	selects.forEach(select => {
		const currentValue = select.value;
		clearSelectOptions(select, t("noSelection"));

		allEffectIds.forEach(effectId => {
			const option = document.createElement("option");
			option.value = effectId;
			option.textContent = getEffectDisplayNameById(effectId);
			select.appendChild(option);
		});

		if ([...select.options].some(option => option.value === currentValue)) {
			select.value = currentValue;
		}
	});
}

function renderEffectBadge(effectId) {
	const img = effectsMap[effectId];
	const safeName = escapeHtml(getEffectDisplayNameById(effectId));

	return `
		<span class="effect">
			${img ? `<img src="${escapeHtml(img)}" alt="${safeName}" class="effect-icon">` : ""}
			<span>${safeName}</span>
		</span>
	`;
}

function findItemById(itemId) {
	return items.find(item => getItemId(item) === itemId);
}

function renderItem(itemId) {
	if (!itemId) {
		itemResult.innerHTML = `
			<h2>${escapeHtml(t("noItemSelectedTitle"))}</h2>
			<p>${escapeHtml(t("noItemSelectedText"))}</p>
		`;
		return;
	}

	const item = findItemById(itemId);

	if (!item) {
		itemResult.innerHTML = `
			<h2>${escapeHtml(t("itemNotFoundTitle"))}</h2>
			<p>${escapeHtml(t("itemNotFoundText"))}</p>
		`;
		return;
	}

	const itemName = getItemDisplayName(item);
	const specialText = getSpecialEffectText(item) || t("noSpecialEffect");
	const itemEffects = item.alchemyEffects || [];
	const effectsHtml = itemEffects.length
		? itemEffects.map(effectId => `<li class="badge">${renderEffectBadge(effectId)}</li>`).join("")
		: `<li class="badge">${escapeHtml(t("noAlchemyEffects"))}</li>`;

	const imageSrc = item.image ? escapeHtml(item.image) : "";
	const imageHtml = imageSrc
		? `
			<div class="item-image-wrap">
				<img
					class="item-image"
					src="${imageSrc}"
					alt="${escapeHtml(itemName)}"
					onerror="this.outerHTML='<div class=&quot;image-missing&quot;>${escapeHtml(t("imageNotFoundWithPath"))} ${imageSrc}</div>';"
				/>
			</div>
		`
		: `<div class="image-missing">${escapeHtml(t("noImageListed"))}</div>`;

	itemResult.innerHTML = `
		<h2>${escapeHtml(itemName)}</h2>
		${imageHtml}
		<div class="info-row">
			<span class="info-label">${escapeHtml(t("specialEffect"))}</span>
			<div>${escapeHtml(specialText)}</div>
		</div>
		<div class="info-row">
			<span class="info-label">${escapeHtml(t("alchemyEffects"))}</span>
			<ul class="effect-list">${effectsHtml}</ul>
		</div>
	`;
}

function getSelectedEffects() {
	return [effectSelect.value, effectSelect2.value, effectSelect3.value]
		.filter((value, index, arr) => value && arr.indexOf(value) === index);
}

function itemHasEffect(item, effectId) {
	const itemEffects = (item.alchemyEffects || []).map(effect => normalizeEffect(getEffectId(effect)));
	return itemEffects.includes(normalizeEffect(effectId));
}

function countSelectedEffectsInGroup(group, selectedEffects) {
	const counts = {};

	selectedEffects.forEach(effectId => {
		counts[effectId] = 0;
	});

	group.forEach(item => {
		selectedEffects.forEach(effectId => {
			if (itemHasEffect(item, effectId)) {
				counts[effectId]++;
			}
		});
	});

	return counts;
}

function isValidPotionGroup(group, selectedEffects) {
	if (group.length < 3 || group.length > 4) {
		return false;
	}

	const counts = countSelectedEffectsInGroup(group, selectedEffects);

	return selectedEffects.every(effectId => counts[effectId] >= 3 && counts[effectId] <= 4);
}

function getCombinations(sourceItems, size) {
	const results = [];

	function buildCombo(startIndex, currentCombo) {
		if (currentCombo.length === size) {
			results.push([...currentCombo]);
			return;
		}

		for (let i = startIndex; i < sourceItems.length; i++) {
			currentCombo.push(sourceItems[i]);
			buildCombo(i + 1, currentCombo);
			currentCombo.pop();
		}
	}

	buildCombo(0, []);
	return results;
}

function findAllPotionGroups(selectedEffects) {
	const candidateItems = items
		.filter(item => selectedEffects.some(effectId => itemHasEffect(item, effectId)))
		.sort((a, b) => getItemDisplayName(a).localeCompare(getItemDisplayName(b), currentLang));

	const validGroups = [];
	const seen = new Set();

	for (const size of [3, 4]) {
		const combinations = getCombinations(candidateItems, size);

		for (const group of combinations) {
			if (!isValidPotionGroup(group, selectedEffects)) {
				continue;
			}

			const key = group
				.map(item => getItemId(item).trim().toLowerCase())
				.sort()
				.join("|");

			if (!seen.has(key)) {
				seen.add(key);
				validGroups.push(group);
			}
		}
	}

	return validGroups;
}

function buildItemCardHtml(item) {
	const itemName = getItemDisplayName(item);
	const imageSrc = item.image ? escapeHtml(item.image) : "";
	const imageHtml = imageSrc
		? `
			<div class="item-image-wrap">
				<img
					class="item-image"
					src="${imageSrc}"
					alt="${escapeHtml(itemName)}"
					onerror="this.outerHTML='<div class=&quot;image-missing&quot;>${escapeHtml(t("imageNotFound"))}</div>';"
				/>
			</div>
		`
		: `<div class="image-missing">${escapeHtml(t("noImageListed"))}</div>`;

	const effectsHtml = (item.alchemyEffects && item.alchemyEffects.length)
		? item.alchemyEffects.map(effectId => `<li class="badge">${renderEffectBadge(effectId)}</li>`).join("")
		: `<li class="badge">${escapeHtml(t("noAlchemyEffects"))}</li>`;

	const specialEffect = getSpecialEffectText(item);
	const specialHtml = specialEffect
		? `
			<div class="info-row">
				<span class="info-label">${escapeHtml(t("specialEffect"))}</span>
				<div>${escapeHtml(specialEffect)}</div>
			</div>
		`
		: "";

	return `
		<li>
			${imageHtml}
			<div><strong>${escapeHtml(itemName)}</strong></div>
			${specialHtml}
			<div class="info-row">
				<span class="info-label">${escapeHtml(t("alchemyEffects"))}</span>
				<ul class="effect-list">${effectsHtml}</ul>
			</div>
		</li>
	`;
}

function renderEffectResults() {
	const selectedEffects = getSelectedEffects();

	if (!selectedEffects.length) {
		effectResult.innerHTML = `
			<h2>${escapeHtml(t("noEffectsSelectedTitle"))}</h2>
			<p>${escapeHtml(t("noEffectsSelectedText"))}</p>
		`;
		return;
	}

	const selectedEffectsHtml = selectedEffects
		.map(effectId => `<li class="badge">${renderEffectBadge(effectId)}</li>`)
		.join("");

	if (selectedEffects.length === 1) {
		const matchingItems = items
			.filter(item => itemHasEffect(item, selectedEffects[0]))
			.sort((a, b) => getItemDisplayName(a).localeCompare(getItemDisplayName(b), currentLang));

		if (!matchingItems.length) {
			effectResult.innerHTML = `
				<h2>${escapeHtml(t("noMatchingIngredientsTitle"))}</h2>
				<div class="info-row">
					<span class="info-label">${escapeHtml(t("selectedEffect"))}</span>
					<ul class="effect-list">${selectedEffectsHtml}</ul>
				</div>
				<p>${escapeHtml(t("noMatchingIngredientsText"))}</p>
			`;
			return;
		}

		const listHtml = matchingItems.map(buildItemCardHtml).join("");
		const ingredientLabel = matchingItems.length === 1 ? t("ingredient") : t("ingredients");

		effectResult.innerHTML = `
			<h2>${escapeHtml(t("matchingIngredientsTitle"))}</h2>
			<div class="info-row">
				<span class="info-label">${escapeHtml(t("selectedEffect"))}</span>
				<ul class="effect-list">${selectedEffectsHtml}</ul>
			</div>
			<div class="info-row">
				<span class="info-label">${escapeHtml(t("matches"))}</span>
				<div>${matchingItems.length} ${escapeHtml(ingredientLabel)}</div>
			</div>
			<ul class="item-list">${listHtml}</ul>
		`;
		return;
	}

	const validGroups = findAllPotionGroups(selectedEffects);

	if (!validGroups.length) {
		effectResult.innerHTML = `
			<h2>${escapeHtml(t("noValidPotionGroupsTitle"))}</h2>
			<div class="info-row">
				<span class="info-label">${escapeHtml(t("selectedEffects"))}</span>
				<ul class="effect-list">${selectedEffectsHtml}</ul>
			</div>
			<p>${escapeHtml(t("noValidPotionGroupsText"))}</p>
		`;
		return;
	}

	const groupsHtml = validGroups.map((group, index) => {
		const counts = countSelectedEffectsInGroup(group, selectedEffects);

		const countBadges = selectedEffects.map(effectId => {
			return `<li class="badge">${renderEffectBadge(effectId)}: ${counts[effectId]}</li>`;
		}).join("");

		const itemsHtml = group.map(buildItemCardHtml).join("");
		const ingredientLabel = group.length === 1 ? t("ingredient") : t("ingredients");

		return `
			<div class="result-card" style="margin-top: 16px;">
				<h3>${escapeHtml(t("group"))} ${index + 1}</h3>
				<div class="info-row">
					<span class="info-label">${escapeHtml(t("effectCountsInGroup"))}</span>
					<ul class="effect-list">${countBadges}</ul>
				</div>
				<div class="info-row">
					<span class="info-label">${escapeHtml(t("groupSize"))}</span>
					<div>${group.length} ${escapeHtml(ingredientLabel)}</div>
				</div>
				<ul class="item-list">${itemsHtml}</ul>
			</div>
		`;
	}).join("");

	effectResult.innerHTML = `
		<h2>${escapeHtml(t("potionBuilderResultsTitle"))}</h2>
		<div class="info-row">
			<span class="info-label">${escapeHtml(t("selectedEffects"))}</span>
			<ul class="effect-list">${selectedEffectsHtml}</ul>
		</div>
		<div class="info-row">
			<span class="info-label">${escapeHtml(t("validGroupsFound"))}</span>
			<div>${validGroups.length}</div>
		</div>
		${groupsHtml}
	`;
}

function activateTab(tabId) {
	tabButtons.forEach(button => {
		button.classList.toggle("active", button.dataset.tab === tabId);
	});

	tabContents.forEach(content => {
		content.classList.toggle("active", content.id === tabId);
	});
}

async function loadEffects() {
	const response = await fetch("effects.json");

	if (!response.ok) {
		throw new Error(t("couldNotLoadEffectsTitle"));
	}

	effects = await response.json();
	buildEffectsMap();
}

async function loadItems() {
	const response = await fetch("items.json");

	if (!response.ok) {
		throw new Error(t("couldNotLoadItemsTitle"));
	}

	items = await response.json();
}

function renderLoadingState() {
	itemResult.innerHTML = `
		<h2>${escapeHtml(t("loadingTitle"))}</h2>
		<p class="loading-note">${escapeHtml(t("loadingText"))}</p>
	`;

	effectResult.innerHTML = `
		<h2>${escapeHtml(t("loadingTitle"))}</h2>
		<p class="loading-note">${escapeHtml(t("loadingText"))}</p>
	`;
}

function rerenderAll() {
	applyStaticTranslations();
	populateItemDropdown();
	populateEffectDropdowns();
	renderItem(itemSelect.value);
	renderEffectResults();
	renderAcknowledgements(acknowledgements);
}

async function setLanguage(lang) {
	currentLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
	languageSelect.value = currentLang;

	localStorage.setItem("everwind-language", currentLang);
	updateUrlLanguage(currentLang);

	await loadLanguage(currentLang);
	rerenderAll();
}

async function initialize() {
	currentLang = getPreferredLanguage();
	languageSelect.value = currentLang;

	await loadLanguage(currentLang);
	applyStaticTranslations();
	renderLoadingState();

	await Promise.all([
		loadEffects(),
		loadItems(),
		loadAcknowledgements()
	]);

	renderAcknowledgements(acknowledgements);
	populateItemDropdown();
	populateEffectDropdowns();
	renderItem(itemSelect.value);
	renderEffectResults();
}

tabButtons.forEach(button => {
	button.addEventListener("click", () => {
		activateTab(button.dataset.tab);
	});
});

itemSelect.addEventListener("change", event => {
	renderItem(event.target.value);
});

[effectSelect, effectSelect2, effectSelect3].forEach(select => {
	select.addEventListener("change", () => {
		renderEffectResults();
	});
});

languageSelect.addEventListener("change", async event => {
	await setLanguage(event.target.value);
});

initialize().catch(error => {
	const message = error?.message || t("unknownError");

	itemResult.innerHTML = `
		<h2>${escapeHtml(t("couldNotLoadItemsTitle"))}</h2>
		<p>${escapeHtml(message)}</p>
	`;

	effectResult.innerHTML = `
		<h2>${escapeHtml(t("couldNotLoadItemsTitle"))}</h2>
		<p>${escapeHtml(message)}</p>
	`;
});