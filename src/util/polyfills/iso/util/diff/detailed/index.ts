import addedDiff from '../added'
import deletedDiff from '../deleted'
import updatedDiff from '../updated'

export default function detailedDiff<L extends Object, R extends Object>(lhs: L, rhs: R) {
  return {
    added: addedDiff(lhs, rhs),
    deleted: deletedDiff(lhs, rhs),
    updated: updatedDiff(lhs, rhs),
  }
}
