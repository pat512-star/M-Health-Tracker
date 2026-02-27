
import React from 'react';
import { PartnerType } from './types';

export const DOMAIN_LABELS = {
  [PartnerType.HUSBAND]: {
    d1: "Respect",
    d2: "Admired",
    d3: "Physical Intimacy",
    d1Labels: {
      0: "Consistently disrespected",
      5: "Respected half the time",
      10: "Honoured and respected"
    },
    d2Labels: {
      0: "Denigrated and put down",
      5: "Admired most of time",
      10: "Consistently admired"
    },
    d3Labels: {
      0: "Rarely or never",
      5: "Infrequent/lacks passion",
      10: "Regular/Wholehearted"
    }
  },
  [PartnerType.WIFE]: {
    d1: "Safety",
    d2: "Cared For",
    d3: "Known",
    d1Labels: {
      0: "Unpredictable and scary",
      5: "Comfortable most time",
      10: "Safe and free"
    },
    d2Labels: {
      0: "Feel neglected",
      5: "Mostly cared for",
      10: "Loved and cherished"
    },
    d3Labels: {
      0: "Don't feel understood",
      5: "Mostly known",
      10: "Fully understood"
    }
  },
  overall: {
    0: "It is horrible!",
    5: "Mostly good but...",
    10: "Things are great!"
  }
};
