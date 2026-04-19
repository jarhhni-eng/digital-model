'use client'

import { use } from 'react'
import { mockTests } from '@/lib/mock-data'
import { BEERY_VMI_TEST_ID } from '@/lib/beery-vmi'
import { VISUO_CONSTRUCTIVE_TEST_ID } from '@/lib/visuo-constructive'
import { TVPS_TEST_ID } from '@/lib/tvps'
import { SYLLOGISM_TEST_ID } from '@/lib/syllogism-test'
import { RAVENS_TEST_ID } from '@/lib/ravens-test'
import { SPATIAL_ORIENTATION_TEST_ID } from '@/lib/spatial-orientation-test'
import { MENTAL_ROTATION_TEST_ID } from '@/lib/mental-rotation-test'
import { BeeryVMITest } from '@/components/beery-vmi/beery-vmi-test'
import { VisuoConstructiveTest } from '@/components/visuo-constructive/visuo-constructive-test'
import { TVPSTest } from '@/components/tvps/tvps-test'
import { SyllogismTest } from '@/components/syllogism/syllogism-test'
import { RavensTest } from '@/components/ravens/ravens-test'
import { SpatialOrientationTest } from '@/components/spatial-orientation/spatial-orientation-test'
import { MentalRotationTest } from '@/components/mental-rotation/mental-rotation-test'
import { GenericTestRunner } from '@/components/assessment/generic-test-runner'

interface TestPageProps {
  params: Promise<{ testId: string }>
}

export default function TestPage({ params }: TestPageProps) {
  const { testId } = use(params)
  const test = mockTests.find((t) => t.id === testId)

  if (testId === BEERY_VMI_TEST_ID) {
    return <BeeryVMITest />
  }
  if (testId === VISUO_CONSTRUCTIVE_TEST_ID) {
    return <VisuoConstructiveTest />
  }
  if (testId === TVPS_TEST_ID) {
    return <TVPSTest />
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

  return <GenericTestRunner test={test} />
}
