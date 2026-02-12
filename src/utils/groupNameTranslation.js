export const getTranslatedGroupName = (group, t) => {
  if (!group) return '';

  const adoptionCountry = group.adoption_country;
  const residenceCountry = group.residence_country;
  const groupType = group.group_type;

  const adoptionCountryTranslated = adoptionCountry ? t(`countries.${adoptionCountry}`, adoptionCountry) : '';
  const residenceCountryTranslated = residenceCountry ? t(`countries.${residenceCountry}`, residenceCountry) : '';

  const groupTypeLabel = groupType === 'adopted' ? t('groups.adoptees') :
                         groupType === 'parents' ? t('groups.parents') :
                         t('groups.partner');

  if (adoptionCountry && residenceCountry) {
    return `${adoptionCountryTranslated} → ${residenceCountryTranslated} (${groupTypeLabel})`;
  } else if (adoptionCountry && !residenceCountry) {
    return `${adoptionCountryTranslated} → ${t('countries.Worldwide')} (${groupTypeLabel})`;
  } else if (residenceCountry && !adoptionCountry) {
    return `${residenceCountryTranslated} (${groupTypeLabel})`;
  }

  return group.name || '';
};
