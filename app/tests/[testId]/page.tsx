'use client'

import { use } from 'react'
import { mockTests } from '@/lib/mock-data'
import { BEERY_VMI_TEST_ID } from '@/lib/beery-vmi'
import { VISUO_CONSTRUCTIVE_TEST_ID } from '@/lib/visuo-constructive'
import { VP_HUB_TEST_ID, getSubtestByTestId } from '@/lib/visuo-perceptive'
import { VPHub } from '@/components/visuo-perceptive/vp-hub'
import { VPSubtestRunner } from '@/components/visuo-perceptive/vp-subtest-runner'
import { SYLLOGISM_TEST_ID } from '@/lib/syllogism-test'
import { RAVENS_TEST_ID } from '@/lib/ravens-test'
import { SPATIAL_ORIENTATION_TEST_ID } from '@/lib/spatial-orientation-test'
import { MENTAL_ROTATION_TEST_ID } from '@/lib/mental-rotation-test'
import { MENTAL_CUTTING_TEST_ID } from '@/lib/mental-cutting-test'
import { CORSI_TEST_ID } from '@/lib/corsi-test'
import { DIVIDED_ATTENTION_TEST_ID } from '@/lib/attentional/divided-attention'
import { SELECTIVE_ATTENTION_TEST_ID } from '@/lib/attentional/selective-attention'
import { SUSTAINED_ATTENTION_TEST_ID } from '@/lib/attentional/sustained-attention'
import { TRAIL_MAKING_TEST_ID } from '@/lib/attentional/trail-making'
import { SHIFTING_ATTENTION_TEST_ID } from '@/lib/attentional/shifting-attention'
import { RAVLT_TEST_ID } from '@/lib/memory/ravlt'
import { DIGIT_SPAN_TEST_ID } from '@/lib/memory/digit-span'
import { DividedAttentionTest } from '@/components/attentional/divided-attention-test'
import { RAVLTTest } from '@/components/memory/ravlt-test'
import { DigitSpanTest } from '@/components/memory/digit-span-test'
import { SelectiveAttentionTest } from '@/components/attentional/selective-attention-test'
import { SustainedAttentionTest } from '@/components/attentional/sustained-attention-test'
import { TrailMakingTest } from '@/components/attentional/trail-making-test'
import { ShiftingAttentionTest } from '@/components/attentional/shifting-attention-test'
import { BeeryMotriceTest } from '@/components/beery-motrice/beery-motrice-test'
import { VisuoConstructiveTest } from '@/components/visuo-constructive/visuo-constructive-test'
import { SyllogismTest } from '@/components/syllogism/syllogism-test'
import { RavensTest } from '@/components/ravens/ravens-test'
import { SpatialOrientationTest } from '@/components/spatial-orientation/spatial-orientation-test'
import { MentalRotationTest } from '@/components/mental-rotation/mental-rotation-test'
import { MentalCuttingTest } from '@/components/mental-cutting/mental-cutting-test'
import { CorsiTest } from '@/components/corsi/corsi-test'
import { VectorsQuizTest } from '@/components/geometry/vectors-quiz'
import { TrigonometryQuizTest } from '@/components/trigonometry/trigonometry-quiz'
import { GenericTestRunner } from '@/components/assessment/generic-test-runner'
import { VECTORS_TEST_ID } from '@/lib/geo-vectors-lesson'
import { TRIG_TEST_ID } from '@/lib/trigonometry-lesson'
import { SPATIAL_GEOMETRY_TEST_ID } from '@/lib/geometry/spatial-geometry'
import { SpatialGeometryQuiz } from '@/components/geometry/spatial-geometry-quiz'
import { SYMETRIE_AXIALE_TEST_ID } from '@/lib/geometry/symetrie-axiale'
import { SymetrieAxialeQuiz } from '@/components/geometry/symetrie-axiale-quiz'

interface TestPageProps {
  params: Promise<{ testId: string }>
}

export default function TestPage({ params }: TestPageProps) {
  const { testId } = use(params)
  const test = mockTests.find((t) => t.id === testId)

  if (testId === BEERY_VMI_TEST_ID) {
    return <BeeryMotriceTest />
  }
  if (testId === VISUO_CONSTRUCTIVE_TEST_ID) {
    return <VisuoConstructiveTest />
  }
  if (testId === VP_HUB_TEST_ID) {
    return <VPHub />
  }
  const vpSubtest = getSubtestByTestId(testId)
  if (vpSubtest) {
    return <VPSubtestRunner subtest={vpSubtest} />
  }
  if (testId === SYLLOGISM_TEST_ID) {
    return <SyllogismTest />
  }
  if (testId === RAVENS_TEST_ID) {
    return <RavensTest />
  }
  if (testId === SPATIAL_ORIENTATION_TEST_ID) {
    return <SpatialOrientationTest />
  }
  if (testId === MENTAL_ROTATION_TEST_ID) {
    return <MentalRotationTest />
  }
  if (testId === MENTAL_CUTTING_TEST_ID) {
    return <MentalCuttingTest />
  }
  if (testId === CORSI_TEST_ID) {
    return <CorsiTest />
  }
  if (testId === DIVIDED_ATTENTION_TEST_ID) {
    return <DividedAttentionTest />
  }
  if (testId === SELECTIVE_ATTENTION_TEST_ID) {
    return <SelectiveAttentionTest />
  }
  if (testId === SUSTAINED_ATTENTION_TEST_ID) {
    return <SustainedAttentionTest />
  }
  if (testId === TRAIL_MAKING_TEST_ID) {
    return <TrailMakingTest />
  }
  if (testId === SHIFTING_ATTENTION_TEST_ID) {
    return <ShiftingAttentionTest />
  }
  if (testId === RAVLT_TEST_ID) {
    return <RAVLTTest />
  }
  if (testId === DIGIT_SPAN_TEST_ID) {
    return <DigitSpanTest />
  }
  if (testId === VECTORS_TEST_ID) {
    return <VectorsQuizTest />
  }
  if (testId === TRIG_TEST_ID) {
    return <TrigonometryQuizTest />
  }
  if (testId === SPATIAL_GEOMETRY_TEST_ID) {
    return <SpatialGeometryQuiz />
  }
  if (testId === SYMETRIE_AXIALE_TEST_ID) {
    return <SymetrieAxialeQuiz />
  }

  return <GenericTestRunner test={test} />
}
